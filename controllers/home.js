/**
 * GET /
 * Home page.
 */
var Video = require('../models/Video');
var moment = require('moment');
var _ = require('underscore');
var watchlist = require('../config/watchlist');
var Author = require('../models/Author');
var genCaptcha = require('../libs/genCaptcha');
var pageSize = 15;

function constructVideoPagingQuery(page, pageSize) {
    return Video.find().skip((page-1)*pageSize).limit(pageSize)
        .sort('-published');
}


function errorHelper(query, cb) {
    query.exec(function (err, results) {
        if (err) {
            res.render('error', {
                title: 'Oops, bad thing happens'
            });
        } else {
            cb(results);
        }
    });
}

exports.listParamCons = function (req, res) {
    req.params.page = Number(req.params.page || 1);
};


exports.index = function(req, res) {
    var page = Number(req.params.page || 1);
    errorHelper(constructVideoPagingQuery(page, pageSize), function (videos) {
        _.map(videos, function (video) {
            video.formattedPublished = (new moment(video.published)).format('YYYY/MM/DD');
        });
        res.render("home", {
            title: "Newest",
            items: videos,
            page: page,
            req: req
        });
    });
};

exports.checkUser = function (req, res) {
    if (req.user === undefined) {
        res.render('account/login', {
            hint: '还没有登录，请先登录或<a href="/signup">注册</a>。',
            title: 'Login',
            captcha: genCaptcha(req, res)
        });
        return false;
    } else {
        return true;
    }
};
// toggle following list
exports.togglefollowing = function (req, res) {
    if (!checkUser(req, res)) {
        return ;
    }
    if (req.user && req.body.authorName) {
        var user = req.user;
        if (_.contains(user.following, req.body.authorName))
            user.following = _.without(user.following, req.body.authorName);
        else
            user.following.push(req.body.authorName);
        user.save(function (err) {
            if (err) {
                console.log("err on authorListPost save", err.toString());
            }
            var redirect = req.body.redirect || "/";
            res.redirect(redirect);
        });
    }
};

exports.authorList = function(req, res) {
    var authorName = req.params.authorName;
    if (authorName === undefined) {
        Author.find(function (err, authors) {
            if (err) {
                res.render('exception', {title: err.toString()});
                return;
            }
            res.render('authors', {title: 'Authors',
                                   authors: authors,
                                   req: req});
        });
        return ;
    }
    var page = Number(req.params.page || 1);
    errorHelper(constructVideoPagingQuery(page, pageSize).where('authorName').equals(authorName), function (videos) {
        _.map(videos, function (video) {
            video.formattedPublished = (new moment(video.published)).format('YYYY/MM/DD');
        });
        res.render("home", {
            title: "Author",
            items: videos,
            page: page,
            currentAuthor: authorName,
            req: req
        });
    });
};

exports.groupbyauthor = function(req, res) {
    var page = Number(req.params.page || 1);
    errorHelper(constructVideoPagingQuery(page, pageSize), function (videos) {
        _.map(videos, function (video) {
            video.formattedPublished = (new moment(video.published)).format('YYYY/MM/DD');
        });
        var groups = _.groupBy(videos, 'authorName');
        res.render('groupbyauthor', {title: 'Newest',
                                     groups: groups,
                                     page: page,
                                     req: req});
    });
};

exports.following = function (req, res) {
    followingHelper(req, res, false);
};

exports.followingGroupByAuthor = function (req, res) {
    followingHelper(req, res, true);
};

function followingHelper(req, res, groupbyauthor) {
    var following = [];
    if (!checkUser(req, res)) {
        return ;
    } else {
        following = req.user.following;
    }
    if (following.length == 0) {
        Author.find(function (err, authors) {
            if (err) {
                res.render('exception', {title: err.toString()});
                return;
            }
            res.render('authors', {title: 'Following',
                                   authors: authors,
                                   hint: '你还没有关注一个解说哦，快来关注一下吧。',
                                   req: req});
        });
    } else {
        var page = Number(req.params.page || 1);
        errorHelper(constructVideoPagingQuery(page, pageSize).where('authorName').in(following), function (videos) {
            _.map(videos, function (video) {
                video.formattedPublished = (new moment(video.published)).format('YYYY/MM/DD');
            });
            if (!groupbyauthor) {
                res.render('home', {title: 'Following',
                                    page: page,
                                    items: videos,
                                    req: req});
            } else {
                var groups = _.groupBy(videos, 'authorName');
                res.render('groupbyauthor', {title: 'Following',
                                             page: page,
                                             groups: groups,
                                             req: req});
            }
        });
    }

};