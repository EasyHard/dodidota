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
var setto = process.argv[3] || 'isamatch';
db.once('open', function () {
    async.waterfall([function (cb) {
        Video.find({'title':new RegExp(process.argv[2])}).exec(cb);
    }, function (videos, cb) {
        _.each(videos, function(video) {
            console.log(video.title);
        });
        yesno.ask('Do you think all these are ' + setto + '?', null, function (mark) {
            if (mark)
                cb(null);
            else
                cb(new Error('not all, not all'));
        });
    }, function (cb) {
        Video.update({'title':new RegExp(process.argv[2])},
                     {match:{manuallySet:true, type:setto}}, {multi:true}, cb);
    }], function (err, na, rr) {
        if (err) {
            console.log(err);
        } else {
            console.log(na, rr);
        }
        console.log('about to disconnect');
        mongoose.disconnect(function () {
            process.stdin.pause();
            console.log('done');
        });
    });
});