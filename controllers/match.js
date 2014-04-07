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
        var tournament;
        async.waterfall([function (cb) {
            Tournament.findOne({name:req.params.matchName})
                .populate('teams').exec(cb);
        }, function (tour, cb) {
            if (tour === null) {
                cb(new Error('比赛不存在'));
                return ;
            }
            tournament = tour;
            tournament.populateVideos(cb);
        }], function (err) {
            if (err) {
                next(err);
                return;
            }
            if (req.query.authorName) {
                tournament.videosFilterByAuthorName(req.query.authorName);
            }
            res.render('tournament', {
                title: 'Match',
                tournament: tournament,
                query: query(tournament),
                _: _,
                stringify: function (obj) {
                    obj = _.extend(obj, req.query);
                    return require('querystring').stringify(obj);
                }
            });
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
                    if (tournament.tournament.name === 'GroupStage') {
                        Video.find().where('_id').in(query(tournament)(req.query))
                            .exec(function (err, videos) {
                                if (err) {
                                    res.render('exception', {
                                        title: err.toString()
                                    });
                                } else {
                                    if (req.query.authorName)
                                        videos = _.filter(videos, function (video) {return video.authorName === req.query.authorName;});
                                    res.render('home',
                                               {title: 'Match',
                                                legend: tournament.name + "  " + req.query.teamName1 + " vs " + req.query.teamName2,
                                                items: videos});
                                }
                            });
                    } else {
                        // Duel
                        if (!req.query.s || !req.query.m || !req.query.r) {
                            res.render('exception', {
                                title: '参数错误。'
                            });
                            return;
                        }
                        var mid = {s:Number(req.query.s), m:Number(req.query.m), r:Number(req.query.r)};
                        var matches = tournament.tournament.findMatches(mid);
                        if (matches.length === 0) {
                            res.render('exception', {
                                title: '无法找到指定比赛。'
                            });
                            return;
                        }
                        var videoids = matches[0].videos;
                        Video.find().where('_id').in(videoids)
                            .exec(function (err, videos) {
                                if (err) {
                                    res.render('exception', {
                                        title: err.toString()
                                    });
                                } else {
                                    if (req.query.authorName)
                                        videos = _.filter(videos, function (video) {return video.authorName === req.query.authorName;});
                                    var zb;
                                    if (tournament.tournament.last > 1) {
                                        if (mid.s === 1)
                                            zb = '胜者组第'+mid.r+'轮';
                                        if (mid.s === 2)
                                            zb = '败者组第'+mid.r+'轮';
                                        if (mid.s === 3)
                                            zb = '总决赛';
                                    } else {
                                        zb = '淘汰赛第'+mid.r+'轮';
                                    }
                                    var teams = tournament.getMatchTeams(matches[0]);
                                    res.render('home',
                                               {title: 'Match',
                                                legend: tournament.name + "  " + zb + " " + teams[0].name + " v.s " + teams[1].name,
                                                items: videos});
                                }
                            });
                    }
                }
            });
    };
};