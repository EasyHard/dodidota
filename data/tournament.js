'use strict';
var async = require('async');
var _ = require('underscore');
var Team = require('../models/Team');
var Video = require('../models/Video');
var Tournament = require('../models/Tournament');
var tournaments = [
    {name: 'StarLadder9小组赛',
     type: 'rrt',
     alias: ['SL9小组赛', 'SL9中国区', '#BO1[^S]*Starladder中国区'],
     teams: ['DK', 'IG', 'VG', 'LGD', 'NewBee', 'DT', 'TongFu', 'CIS']
    }];

require('./opendbonce')(function (cb) {
    async.eachSeries(tournaments, function(t, cb) {
        async.map(t.teams, function(teamName, cb) {
            Team.findOne({name:teamName}, cb);
        }, function (err, teams) {
            if (err) {
                cb(err);
            } else {
                t.teams = teams;
                if (t.alias === undefined)
                    t.alias = [];
                t.alias.push(t.name);
                var tour = new Tournament(t);
                async.map(tour.alias, function(name, cb) {
                    console.log(name);
                    Video.find({title:new RegExp(name)}, cb);
                }, function(err, result) {
                    if (err)
                        return cb(err);
                    console.log(result);
                    tour.videos = _.map(_.flatten(result),
                        function(video) {return video.id;});
                    return tour.save(cb);
                });

            }
        });
    }, function (err) {
        if (err)
            console.log(err);
        cb();
    });
});