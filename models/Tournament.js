var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Team = require('./Team')
    , Video = require('./Video')
    , groupstage = require('groupstage')
    , _ = require('underscore')
    , request = require('request')
    , cheerio = require('cheerio')
    , async = require('async')
    , fs = require('fs');

var tournamentSchema = new mongoose.Schema({
    name: { type: String, unique: true, index: true},
    alias: [String],
    paddingVideos: [{type: Schema.Types.ObjectId, ref: 'Video'}],
    resultUrl: {type: String},
    teams: [{
        type: Schema.Types.ObjectId, ref: 'Team'
    }],
    startAt: {type: Date},
    skipAfter: {type: Date},
    // a instance of https://github.com/clux/tournament
    tournament : {},
    icon: {type: String}
});

tournamentSchema.post('init', function(doc) {
    if (doc.tournament)
        doc.tournament = groupstage.parse(doc.tournament);
});

tournamentSchema.methods.hasVideo = function (video) {
    var tournament = this;
    var has = _.reduce(_.map(tournament.alias, function(alias) {
        return Boolean(video.title.match(alias));
    }), function (memo, now) {return memo || now;}, false);
    if (tournament.startAt && video.published < tournament.startAt)
        has = false;
    if (tournament.skipAfter && video.published > tournament.skipAfter)
        has = false;
    return has;
};

// Each time saving a tournament, try to add padding videos to match.
tournamentSchema.methods.handlePaddingVideos = function (cb) {
    var tournament = this;
    console.log(this);
    this.populate('paddingVideos', function (err, tournament) {
        if (err) {
            cb(err);
        }
        else {
            console.log('paddingVideo', tournament.paddingVideos);
            for (var i  = 0; i < tournament.paddingVideos.length; i += 1) {
                console.log('handling paddingVideos', tournament.paddingVideos[i].title);
                tournament.addVideo(tournament.paddingVideos[i]);
            }
            cb(null);
        }
    });
};

tournamentSchema.methods.addVideo = function (video) {
    var tournament = this;
    if (!this.hasVideo(video)) {
        return false;
    }
    var succ = false;
    var matches = _.filter(tournament.tournament.matches, function (match) {
        var teams = tournament.getMatchTeams(match);
        return teams.length !== 0 && video.containsTeam(teams[0]) && video.containsTeam(teams[1]);
    });
    if (matches.length > 1 && video.title.match('败者'))
        matches = _.filter(matches, function (match) {return match.id.s === 2;});
    if (matches.length > 1 && video.title.match('胜者'))
        matches = _.filter(matches, function (match) {return match.id.s === 1;});
    if (matches.length > 1 &&
        (video.title.match('决赛') || video.title.match('冠军')) &&
        !video.title.match('胜者') && !video.title.match('败者'))
        matches = _.filter(matches, function (match) {return match.id.s === 3;});
    if (matches.length === 1) {
        matches[0].videos = matches[0].videos || [];
        matches[0].videos.push(video._id);
        tournament.markModified('tournament');
        succ = true;
    } else if (matches.length > 1) {
        console.log('matches can\'t not tell', matches[0].id, matches[0].p, matches[1].id, matches[1].p);
    } else if (matches.length === 0) {
        console.log('no matching match');
    }
    if (!succ) {
        console.log('video', video.title, 'failed to add into a match, but tournament has it');
        // if (tournament.paddingVideos.indexOf(video) === -1)
        //     tournament.paddingVideos.push(video);
    }
    return succ;
};

tournamentSchema.methods.getMatchTeams = function (match) {
    var tournament = this;
    var seeds = match.p;
    if (_.contains(seeds, 0))
        return [];
    return _.map(seeds, function (seed) {
        return tournament.teams[seed-1];
    });
};

tournamentSchema.methods.seedForTeam = function (team) {
    return this.teams.indexOf(team) + 1;
};

// cb<err, tournament>, populated videos are in tournament.tournament.matches
tournamentSchema.methods.populateVideos = function (cb) {
    var tournament = this;
    async.each(tournament.tournament.matches, function (match, cb) {
        if (match.videos) {
            Video.find().where('_id').in(match.videos).exec(function (err, videos) {
                if (err) {
                    cb (err);
                } else {
                    match.videos = videos;
                    cb();
                }
            });
        } else {
            cb();
        }
    }, cb);
};

// cb<err, tournament>, filtered videos are still in tournament.tournament.matches
// make sure vidoes are populated before using this method.
tournamentSchema.methods.videosFilterByAuthorName = function (authorName) {
    var tournament = this;
    _.each(tournament.tournament.matches, function (match) {
        match.videos = _.filter(match.videos, function (video) {
            return video.authorName == authorName;
        });
    });
};

tournamentSchema.methods.getMatchesByTeams = function (teams) {
    var tournament = this;
    var result = [];
    var matches = _.map(teams, function (team) {
        return tournament.tournament.matchesFor(tournament.seedForTeam(team));
    });
    matches = _.intersection.apply(undefined, matches);
    return matches;
};

// update the tournament result by external source (gusogamers.net for this moment)
tournamentSchema.methods.fetchMatchUpdate = function (cb) {
    var tournament = this;
    if (!tournament.tournament.isDone() &&
        tournament.tournament.name === 'Duel' &&
        tournament.resultUrl) {
        var url = tournament.resultUrl;
        async.waterfall([function (cb) {
            request(url, cb);
        }, function (response, body, cb) {
            var $ = cheerio.load(body);
            var brackets = $('.bracket');
            // seeds and team name mapping
            var teams = [];
            var teamIconUrls = [];
            brackets.each(function (s, elem) {
                var rounds = $(this).find('.round');
                rounds.each(function (r, elem) {
                    $(this).find('.match').each(function (m, elem) {
                        var score = [];
                        $(this).find('.opponent > .score').each(function() {
                            score.push(Number($(this).text().trim()));
                        });
                        // maintain the mapping
                        var seeds = [];
                        $(this).find('.opponent > span').each(function() {
                            if ($(this).text().trim() === '' || $(this).text().trim() === '(bye)') {
                                seeds.push(-1);
                                return;
                            }
                            if (teams.indexOf($(this).text()) === -1) {
                                teamIconUrls.push($(this).parent().find('img').attr('src'));
                                teams.push($(this).text());
                            }
                            var seed = teams.indexOf($(this).text()) + 1;
                            if (seed > tournament.teams.length)
                                seeds.push(-1);
                            else
                                seeds.push(seed);
                        });
                        console.log('seeds', seeds);
                        var matchId = {s:s+1, r:r+1, m:m+1};
                        var match = tournament.tournament.findMatch(matchId);
                        if (match && !match.m &&
                            !_.isEqual(score, ['', '']) && !_.isEqual(score, [0, 0]) &&
                            !_.isEqual(score, []) &&
                            !_.isEqual(seeds, [-1, -1]) && !_.isEqual(seeds, [])) {
                            match.p = seeds;
                            match.m = score;
                            // .score can not generate the correct progress
                            //tournament.tournament.score(matchId, score);
                            tournament.markModified('tournament');
                        }
                    });
                });
            });
            async.each(_.zip(teamIconUrls, tournament.teams), function (item, cb) {
                var url = item[0];
                var team = item[1];
                var pipe = request.get('http://www.gosugamers.net/'+url).pipe(fs.createWriteStream('../public/img/teams/'+team.name+".png"));
                pipe.on('error', cb);
                pipe.on('end', cb);
                pipe.on('close', cb);
            }, cb);
        }], cb);
    } else {
        cb();
    }
};
module.exports = mongoose.model('Tournament', tournamentSchema);