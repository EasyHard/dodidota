'use strict';

var request = require('request');
var youku_config = require('../config/secrets').youku;
var client_id = youku_config.client_id;
var client_secrect = youku_config.client_secrect;
var Video = require('../models/Video');
var util = require('util');

var defaultPageSize = 20;

// TODO: use options to configure
function YoukuVideoList(author, options) {
    if (!author) {
        throw new Error('bad author for YoukuVideoList');
    }
    this.options = options || {};
    this.author = author;
    this.current = 0;
    this.list = [];
};

YoukuVideoList.prototype.next = function (cb) {
    var that = this;
    while (this.list[this.current] && this.list[this.current].state != 'normal')
        this.current++;
    if (this.list[this.current]) {
        //console.log('here', this.current);
        //console.log(this.list[this.current]);
        this.current++;
        cb(null, videoFromYouku(this.list[this.current - 1], this.author.name));
    } else {
        var qsOptions = {
            client_id: client_id,
            user_name: this.author.name,
            page: this.current / defaultPageSize + 1,
            count: defaultPageSize
        };
        var options = {
            url: 'https://openapi.youku.com/v2/videos/by_user.json',
            qs: qsOptions,
            json: true
        };
        request(options, function (err, msg, json) {
            if (err) {
                cb(err);
            } else if (json.error) {
                cb(new Error(json.error));
            } else {
                if (json.videos.length == 0) {
                    cb(null, null);
                } else {
                    that.list = that.list.concat(json.videos);
                    that.next(cb);
                }
            }
        });
    }
};

function videoFromYouku(json, author) {
    var video = new Video();
    video.link = json.link;
    video.title = json.title;
    video.authorName = author || json.user.name;
    video.published = json.published;
    video.duration = json.duration;
    return video;
}

module.exports = {
    getInformation: function (link, cb) {
        var option = {
            url: 'https://openapi.youku.com/v2/videos/show_basic.json',
            qs: {
                client_id: client_id,
                video_url: link,
            },
            json: true
        };
        request(option, function (err, msg, json) {
            if (err) {
                cb(err);
            } else {
                cb(null, videoFromYouku(json));
            }
        });
    },

    getUserInformation: function (user_name, cb) {
        var option = {
            url: 'https://openapi.youku.com/v2/users/show.json',
            qs: {
                client_id: client_id,
                user_name: user_name,
            },
            json: true
        };
        request(option, function (err, msg, json) {
            if (err) {
                cb(err);
            } else {
                cb(null, json);
            }
        });
    },

    getVideoListByAuthor: function (author, options) {
        return new YoukuVideoList(author, options);
    }
};