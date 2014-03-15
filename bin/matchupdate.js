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
    Video.update({}, {match: {manuallySet: false,
                                              type: "notset"}},
                                              {multi:true}, function (err, na, rr) {
        if (err) {
            console.log('err on find', err.toString());
            return ;
        } else {
            console.log('done', na, rr);
        }
        mongoose.disconnect();
    });
});