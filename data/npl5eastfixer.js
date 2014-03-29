'use strict';
var async = require('async');
var _ = require('underscore');
var Team = require('../models/Team');
var Video = require('../models/Video');
var Tournament = require('../models/Tournament');
var npl5east = require('./npl5east.js');
require('./opendbonce')(function (cb) {
    async.waterfall([function (cb) {
        Tournament.findOne({name:npl5east.name}, cb);
    }, function (tournament, cb) {
        var videos = tournament.paddingVideos;
        var match = tournament.tournament.findMatches({s:2, r:4, m:1})[0];
        tournament.paddingVideos = [];
        match.videos = match.videos.concat(videos);
        tournament.markModified('tournament');
        tournament.save(cb);
    }], function (err) {
        if (err)
            console.log(err);
        cb();
    });
});