/**
 * GET /
 * Home page.
 */
var Video = require('../models/Video');
var moment = require('moment');
var _ = require('underscore');
var watchlist = require('../config/watchlist');

var pageSize = 15;
function paramPath(params) {
    var result = "";
    if (params.groupby) {
        result += "/groupby" + params.groupby;
    }
    if (params.page)
        result += "/p/" + page;
    return result;
};

exports.index = function(req, res) {
    var params = req.params;
    var pageprefix = "p/";
    if (req.params.page)
        pageprefix = "";
    var page = req.params.page || 1;
    page = Number(page);
    Video.find().skip((page-1)*pageSize).limit(pageSize)
         .sort('-published').exec(function (err, videos) {
        if (err) {
            res.render('error', {
                title: 'Oops, bad thing happens'
            });
        } else {
            _.map(videos, function (video) {
                video.formattedPublished = (new moment(video.published)).format('YYYY/MM/DD');
            });
            res.render('home', {
                title: 'Newest',
                items: videos,
                prevpage: page-1,
                nextpage: page+1,
                pageprefix: pageprefix
            });
        }
    });
};
