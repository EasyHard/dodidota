'use strict';

var Tournament = require('../models/Tournament');
var Team = require('../models/Team');
var async = require('async');
var _ = require('underscore');
function query(tournament) {
    return function(params) {
        _.map(tournament.videos, function(video) {
            video.teams = [];
            _.each(tournament.teams, function(team) {
                _.each(team.alias, function(alias) {
                    if (video.title.match(new RegExp(alias, "i")))
                        video.teams.push(team);
                });
            });
            return video;
        });
        var videos = _.filter(tournament.videos, function(video) {
            var teamName = _.map(video.teams, function(team) {
                return team.name;
            });
            if (teamName.length === 1) {
                console.log(teamName, video.title);
            }
            return teamName.indexOf(params.teamName1) !== -1 &&
                teamName.indexOf(params.teamName2) !== -1;
        });
        return videos;
    };
};
module.exports = function (app) {
    app.get('/tournament/:matchName', prettyMatch);
    function prettyMatch(req, res, next) {
        async.waterfall([function (cb) {
            Tournament.findOne({name:req.params.matchName})
                .populate('teams videos').exec(cb);
        }, function (tournament, cb) {
            if (tournament === null) {
                res.render('exception', {
                    title: '比赛不存在'
                });
            } else {
                res.render('tournament', {
                    title: 'Match',
                    tournament: tournament,
                    query: query(tournament),
                    stringify: require('querystring').stringify
                });
            }
        }], function (err) {
            next(new Error(err));
        });
    }
    app.get('/tournamentDetail', tournamentDetail);

    function tournamentDetail(req, res) {
        Tournament.findOne({_id:req.query.tournamentId})
            .populate('teams videos')
            .exec(function (err, tournament) {
                if (tournament === null) {
                    res.render('exception', {
                        title: '比赛不存在'
                    });
                } else {
                    var videos = query(tournament)(req.query);
                    res.render('home',
                           {title: 'Match',
                            legend: tournament.name + "  " + req.query.teamName1 + " vs " + req.query.teamName2,
                            items: videos});
                }
            });
    };
};