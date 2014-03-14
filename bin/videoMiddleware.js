var Author = require('../models/Author');
var Video = require('../models/Video');
var async = require('async');
var _ = require('underscore');
exports.defaultGametype = function (video, next) {
    video.gametype = "dota1";
    next();
};

exports.authorDefaultGametype = function (video, next) {
    Author.findOne({name: video.authorName}).exec(function (err, author) {
        if (err) {
            next();
        } else {
            video.gametype = author.defaultGametype;
            next();
        }
    });
};

exports.videoNameMatch = function (video, next) {
    if (video.title.toLowerCase().search('dota2') != -1) {
        video.gametype = 'dota2';
    }
    next();
};
/**
 * 海涛从零单闯东南亚 -> Dota2
 */
function HTdny(video, cb) {
    if (video.title.search('海涛从零单闯东南亚') != -1)
        video.gametype = 'dota2';
    next();
};
// order is important.
var middleWare = [exports.defaultGametype, exports.authorDefaultGametype, exports.videoNameMatch, HTdny];
// cb @type{function<video>}
exports.videoMiddleWareProcess = function (video, cb) {
    var middlewareList = _.map(middleWare, function (func) {
        return func.bind(undefined, video);
    });
    async.waterfall(middlewareList, function (err) {
        if (err) {
            console.log('videoMiddleware error:', err.toString());
        } else {
            cb(video);
        }
    });
};