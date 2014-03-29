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
    var tour;
    async.waterfall([function (cb) {
        async.map(t.teams, function(teamName, cb) {
            Team.findOne({name:teamName}, cb);
        }, cb);
    }, function (teams, cb) {
        t.teams = teams;
        if (t.alias === undefined)
            t.alias = [];
        t.alias.push(t.name);
        tour = new Tournament(t);
        tour.fetchMatchUpdate(cb);
    }, function (cb) {
        tour.populate('teams', cb);
    }, function (tt, cb) {
        async.map(tour.alias, function(name, cb) {
            Video.find({title:new RegExp(name)}, cb);
        }, cb);
    }, function (result, cb) {
        console.log('here');
        console.log(tour);
        result = _.flatten(result);
        for (var i = 0; i < result.length; i++) {
            if (tour.addVideo(result[i]))
                console.log('added video', result[i].title);
        }
        console.log('before saving');
        return tour.save(cb);
    }], function (err) {
        console.log('here');
        if (err)
            console.log(err);
        cb();
    });
    // async.map(t.teams, function(teamName, cb) {
    //     Team.findOne({name:teamName}, cb);
    // }, function (err, teams) {
    //     if (err) {
    //         console.log(err);
    //         cb(err);
    //     } else {
    //         t.teams = teams;
    //         if (t.alias === undefined)
    //             t.alias = [];
    //         t.alias.push(t.name);
    //         var tour = new Tournament(t);
    //         async.waterfall([function(cb) {
    //             tour.fetchMatchUpdate(cb);
    //         }, function(cb) {
    //             tour.populate('teams', cb);
    //         }, function(cb) {
    //             async.map(tour.alias, function(name, cb) {
    //                 Video.find({title:new RegExp(name)}, cb);
    //             }, function(err, result) {
    //                 if (err)
    //                     return cb(err);
    //                 console.log(tour);
    //                 result = _.flatten(result);
    //                 for (var i = 0; i < result.length; i++) {
    //                     if (tour.addVideo(result[i]))
    //                         console.log('added video', result[i].title);
    //                 }
    //                 console.log('before saving');
    //                 return tour.save(function (err) {
    //                     if (err)
    //                         console.log(err);
    //                     else
    //                         console.log('saved');
    //                 });
    //             });
    //         }], function (err) {
    //             console.log('here');
    //             if (err)
    //                 console.log(err);
    //             console.log(cb);
    //             cb();
    //         });
    //     }
    // });
});