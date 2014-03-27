var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Team = require('./Team')
    , groupstage = require('groupstage')
    , _ = require('underscore');


var tournamentSchema = new mongoose.Schema({
    name: { type: String, unique: true, index: true},
    alias: [String],
    teams: [{
        type: Schema.Types.ObjectId, ref: 'Team'
    }],
    // matchID->[Vedio.id]
    videos: {},
    // a instance of https://github.com/clux/tournament
    tournament : {}
});

tournamentSchema.post('init', function(doc) {
    if (doc.tournament)
        doc.tournament = groupstage.parse(doc.tournament);
});

tournamentSchema.methods.hasVideo = function (video) {
    var tournament = this;
    return _.reduce(_.map(tournament.alias, function(alias) {
        return Boolean(video.title.match(alias));
    }), function (memo, now) {return memo || now;}, false);
};

tournamentSchema.methods.addVideo = function (video) {
    var tournament = this;
    if (!this.hasVideo(video)) {
        return false;
    }
    var succ = false;
    for (var i = 0; i < tournament.tournament.matches.length; i++) {
        var match = tournament.tournament.matches[i];
        var teams = tournament.getMatchTeams(match);
        if (video.containsTeam(teams[0]) && video.containsTeam(teams[1])) {
            match.videos = match.videos || [];
            match.videos.push(video._id);
            tournament.markModified('tournament');
            succ = true;
        }
    }
    if (!succ)
        console.log('video', video.title, 'failed to add into a match, but tournament has it');
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

tournamentSchema.methods.getMatchesByTeams = function (teams) {
    var tournament = this;
    var result = [];
    var matches = _.map(teams, function (team) {
        return tournament.tournament.matchesFor(tournament.seedForTeam(team));
    });
    matches = _.intersection.apply(undefined, matches);
    return matches;
};

module.exports = mongoose.model('Tournament', tournamentSchema);