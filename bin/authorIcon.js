'use strict';

/**
 * Run this to fetch update of vedios configured in config.watchlist
 **/
var mongoose = require('mongoose');
var secrets = require('../config/secrets');
var watchlist = require('../config/watchlist');
var youku = require('../libs/youku');
var async = require('async');
var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Author = require('../models/Author');
var request = require('request');

mongoose.connect(secrets.db);
var db = mongoose.connection;
db.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

db.once('open', function () {
    Author.find(function (err, authors) {
        if (err) {
            console.log('err on find', err.toString());
            return ;
        }
        console.log(authors);
        async.eachSeries(authors, function (item, cb) {
            console.log('handling', item);
            youku.getUserInformation(item.name, function (err, json) {
                if (err) {
                    console.log('err on getUserInformation', err.toString());
                    return ;
                }
                console.log(json);
                request(json.avatar).pipe(fs.createWriteStream('./public/img/author/'+item.name+'.jpg')).on('close', function (err) {
                    if (err) {
                        console.log('err on avatar', err.toString());
                    }
                    request(json.avatar_large).pipe(fs.createWriteStream('./public/img/author/'+item.name+'_large.jpg'))
                        .on('close', cb);
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

