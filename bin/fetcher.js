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
var Author = require('../models/Author');

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
            var videos = youku.getVideoListByAuthor(item, {orderby: 'published'});
            extractVideo(videos, cb);
        }, function (err) {
            if (err) {
                console.log("err on eachSeries", err.toString());
            }
            mongoose.disconnect();
        });
    });
});

function formatTitle(video) {
    var title = video.title;
    var authorName = video.author;
    var author = _.find(watchlist.authors, function(author) {return author.name === authorName;});
    var formattedTitle = title;
    if (author) {
        var foundAuthorName = false;
        for (var i in author.nicknames) {
            if (formattedTitle.search(author.nicknames[i]) != -1) {
                formattedTitle = formattedTitle.replace(author.nicknames[i], '<em class="author-link" href="/author/' + author.name + '">' + author.nicknames[i] + '</em>');
                foundAuthorName = true;
                break;
            }
        }
        if (!foundAuthorName)
            formattedTitle = '<em class="author-link" href="/author/' + author.name + '"/>  ' + formattedTitle;
    }
    return formattedTitle;
}

function extractVideo(videos, cb) {
    videos.next(function (err, video) {
        if (err) {
            cb(err);
        } else if (video) {
            util.log(video);
            video.formattedTitle = formatTitle(video);
            video.save(function (err) {
                if (err) {
                    if (err.code === 11000) // error code of duplicate key
                    {
                        cb(null);
                    } else {
                        cb(err);
                    }
                } else {
                    extractVideo(videos, cb);
                }
            });
        } else {
            cb(null);
        }
    });
};

