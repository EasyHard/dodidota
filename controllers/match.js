'use strict';

var Tournament = require('../models/Tournament');
var Team = require('../models/Team');
var Video = require('../models/Video');
var async = require('async');
var _ = require('underscore');
function query(tournament) {
    return function(params) {
        var teams = _.map([params.teamName1, params.teamName2], function (teamName) {
            return _.findWhere(tournament.teams, {name:teamName});
        });
        var matches = tournament.getMatchesByTeams(teams);
        var videos = _.flatten(_.map(matches, function (match) {
            if (match)
                return match.videos;
            else
                return [];
        }));
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
            .populate('teams')
            .exec(function (err, tournament) {
                if (tournament === null) {
                    res.render('exception', {
                        title: '比赛不存在'
                    });
                } else {
                    Video.find().where('_id').in(query(tournament)(req.query))
                        .exec(function (err, videos) {
                            if (err) {
                                res.render('exception', {
                                    title: err.toString()
                                });
                            } else {
                                res.render('home',
                                           {title: 'Match',
                                            legend: tournament.name + "  " + req.query.teamName1 + " vs " + req.query.teamName2,
                                            items: videos});
                            }
                        });
                }
            });
    };
};