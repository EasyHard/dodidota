/**
 * This is a command-line tool (also a helper function) to add/update tournaments.
 **/

'use strict';
var async = require('async');
var _ = require('underscore');
var Team = require('../models/Team');
var Video = require('../models/Video');
var Tournament = require('../models/Tournament');
var groupstage = require('groupstage');

var t = require(process.argv[2]);
require('./opendbonce')(function (cb) {
    async.map(t.teams, function(teamName, cb) {
        Team.findOne({name:teamName}, cb);
    }, function (err, teams) {
        if (err) {
            console.log(err);
            cb(err);
        } else {
            t.teams = teams;
            if (t.alias === undefined)
                t.alias = [];
            t.alias.push(t.name);
            var tour = new Tournament(t);
            tour.populate('teams', function (err) {
                async.map(tour.alias, function(name, cb) {
                    Video.find({title:new RegExp(name)}, cb);
                }, function(err, result) {
                    if (err)
                        return cb(err);
                    result = _.flatten(result);
                    for (var i = 0; i < result.length; i++) {
                        if (tour.addVideo(result[i]))
                            //console.log('add video', result[i].title);
                            ;
                    }
                    return tour.save(function (err) {
                        if (err)
                            console.log('err', err);
                        cb();
                    });
                });
            });
        }
    });
});