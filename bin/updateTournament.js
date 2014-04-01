/**
 * This script will try to add videos to tournament's matches pool
 **/

'use strict';
var async = require('async');
var _ = require('underscore');
var Team = require('../models/Team');
var Video = require('../models/Video');
var Tournament = require('../models/Tournament');
var groupstage = require('groupstage');
require('../data/opendbonce')(function (cb) {
    var tournaments;
    async.waterfall([function (cb) {
        Tournament.find().populate('teams').exec(cb);
    }, function (tours, cb) {
        tournaments = tours;
        async.each(tournaments, function (tournament, cb) {
            tournament.populateVideos(cb);
        }, cb);
    }, function (cb) {
        async.eachSeries(tournaments, function (tournament, cb) {
            console.log('tournament handling update', tournament.name);
            async.waterfall([function (cb) {
                tournament.fetchMatchUpdate(cb);
            }, function (cb) {
                // console.log(tournament.paddingVideos);
                // tournament.handlePaddingVideos(cb);
                cb();
            }, function (cb) {
                var addedVideos = _.flatten(_.map(tournament.tournament.matches, function (match) {return match.videos;}));
                addedVideos = addedVideos.concat(tournament.paddingVideos);
                addedVideos = _.filter(addedVideos, function (video) {return video});
//                addedVideos = _.map(addedVideos, function (video) {return video._id;});
//                console.log(tournament.name, 'addedvideos', addedVideos);
                var orConditions = _.map(tournament.alias, function (alias) {return {title: new RegExp(alias, 'i')};});
                Video.find().or(orConditions).where('_id').nin(addedVideos).exec(cb);
            }, function (videos, cb) {
                _.each(videos, function (video) {
                    console.log('new videos', video.title, video._id);
                    if (tournament.addVideo(video))
                        console.log('added video', video.title);
                })
                tournament.save(cb);
                cb();
            }], cb);
        }, cb);
    }], function (err) {
        if (err) {
            console.log('err', err);
        }
        cb();
    });
});