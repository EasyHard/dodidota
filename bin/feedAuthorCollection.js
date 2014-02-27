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
var _ = require('underscore');

mongoose.connect(secrets.db);
var db = mongoose.connection;
var Author = require('../models/Author');
db.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

db.once('open', function () {
    async.eachSeries(watchlist.authors, function (item, cb) {
        console.log('handling', item);
        var author = new Author();
        author.name = item.name;
        author.site = item.site;
        author.nicknames = item.nicknames;
        // author.name = item.icon.replace('/img/author/', '').replace('.jpg', '');
        author.save(cb);
    }, function (err) {
        if (err) {
            console.log(err);
        }
        mongoose.disconnect();
    });
});

