'use strict';

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');
var Video = require('../models/Video');
var secrets = require('../config/secrets');
var videoMiddleWareProcess = require('./videoMiddleware').videoMiddleWareProcess;

mongoose.connect(secrets.db);
var db = mongoose.connection;
db.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

db.once('open', function () {
    Video.find(function (err, videos) {
        if (err) {
            console.log('err on find', err.toString());
            return ;
        }
        async.eachSeries(videos, function (video, cb) {
            videoMiddleWareProcess(video, function(video) {
                video.save(function (err) {
                    if (err) {
                        console.log('err on video.save', err.toString());
                        console.log(video);
                    }
                    cb(null);
                });
            });
        }, function (err) {
            if (err) {
                console.log("err on eachSeries", err.toString());
            }
            mongoose.disconnect();
        });
    });
});