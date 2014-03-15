'use strict';

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');
var Video = require('../models/Video');
var secrets = require('../config/secrets');
var videoMiddleWareProcess = require('./videoMiddleware').videoMiddleWareProcess;
var yesno = require('yesno');
mongoose.connect(secrets.db);
var db = mongoose.connection;
db.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

db.once('open', function () {
    async.waterfall([function (cb) {
        Video.find({'match.manuallySet':false}).exec(cb);
    }, function (videos, cb) {
        var marking =  _.sample(videos, Number(process.argv[2]));
        // console.log(marking);
        // yesno.ask('Do you think it is a match?', null, function (mark) {
        //     cb();
        // });
        async.eachSeries(marking, function (video, cb) {
            console.log(video.title);
            yesno.ask('Do you think it is a match?', null, function (mark) {
                console.log(mark);
                if (mark) {
                    video.match.type = "isamatch";
                } else {
                    video.match.type = "notamatch";
                }
                video.match.manuallySet = true;
                video.save(cb);
            });
        }, function (err) {
            console.log('each cb');
            if (err) {
                console.log(err);
            }
            cb();
        });
    }], function (err) {
        if (err) {
            console.log(err);
        }
        console.log('about to disconnect');
        mongoose.disconnect(function () {
            process.stdin.pause();
            console.log('done');
        });
    });
});