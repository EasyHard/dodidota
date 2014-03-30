'use strict';

var Video = require('../models/Video');
var Tournament = require('../models/Tournament');
var moment = require('moment');
var _ = require('underscore');
var watchlist = require('../config/watchlist');
var Author = require('../models/Author');
var genCaptcha = require('../libs/genCaptcha');
var pageSize = 15;
var homeController = require('./home');

module.exports = function (app) {
    function setget(paths, functions) {
        for (var i = 0; i < paths.length; i++)
            app.get(paths[i], functions);
    }

    function indexQuery(req, res, next) {
        req.query = constructVideoPagingQuery(req.params.page, pageSize);
        req.query = req.query.where('match.type').in(['notset', 'notamatch']);
        next();
    }

    function index(req, res) {
        var videos = req.videos;
        var title = 'Newest';
        if (req.params.groupby) {
            var groups = _.groupBy(videos, req.params.groupby);
            title = 'GroupBy' + req.params.groupby;
            res.render("groupbyauthor", {
                title: "Group",
                groups: groups
            });
        } else {
            res.render("home", {
                title: "Newest",
                items: videos
            });
        }
    };
    setget(['/', '/p/:page', '/gby/:groupby', '/gby/:groupby/p/:page'],
           [paramCons,
            setLocals,
            indexQuery,
            doQuery,
            index]);

    function authorQuery(req, res, next) {
        req.query = constructVideoPagingQuery(req.params.page, pageSize);
        req.query.where('authorName').equals(req.params.authorName);
        next();
    }
    function authorList(req, res) {
        res.render("home", {
            title: "Author",
            items: req.videos,
            currentAuthor: req.params.authorName
        });
    }
    setget(['/author/:authorName/', '/author/:authorName/p/:page'],
           [paramCons,
            setLocals,
            authorQuery,
            doQuery,
            authorList]);

    function followingQuery(req, res, next) {
        req.query = constructVideoPagingQuery(req.params.page, pageSize);
        req.query = req.query.where('authorName').in(req.user.following);
        next();
    }

    function followingChecker(req, res, next) {
        if (!req.user.following || req.user.following.length === 0) {
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
            next();
        }
    }
    function setFollowing(req, res, next) {
        req.params.following = true;
        next();
    }
    function followingList(req, res) {
        if (!req.params.groupby) {
            res.render('home', {title: 'Following',
                                items: req.videos
                               });
        } else {
            var groups = _.groupBy(req.videos, 'authorName');
            res.render('groupbyauthor', {title: 'Following',
                                         groups: groups
                                        });
        }
    }
    setget(['/following/', '/following/p/:page', '/following/gby/:groupby/', '/following/gby/:groupby/p/:page'],
           [homeController.checkUser,
            followingChecker,
            setFollowing,
            paramCons,
            setLocals,
            followingQuery,
            doQuery,
            followingList]);

    function matchQuery(req, res, next) {
        req.query = constructVideoPagingQuery(req.params.page, pageSize);
        req.query = req.query.where('match.type').nin(['notset', 'notamatch']);
        next();
    }

    function matchList(req, res, next) {
        res.render("home", {
            title: "Match",
            items: req.videos
        });
    }
    setget(['/matchlist/', '/matchlist/p/:page'],
           [paramCons,
            setLocals,
            matchQuery,
            doQuery,
            matchList]);

    setget(['/match/'],
           [paramCons,
            setLocals,
            matchQuery,
            doQuery,
            match]);

    function match(req, res) {
        Tournament.find(function(err, tournaments, next) {
            if (err) {
                return next(err);
            }
            return res.render('match', {
                title: "Match",
                items: req.videos,
                tournaments: tournaments
            });
        });
    }

    function paramCons(req, res, next) {
        req.params = req.params || {};
        req.params.page = Number(req.params.page || 1);
        if (req.params.groupby) {
            if (req.params.groupby != 'authorName') {
                delete req.params.groupbyreq.params.groupby;
            }
        }
        if (req.path.match('/matchlist/'))
            req.params.match = true;
        next();
    }

    function canonicalURL(params) {
        var url = "/";
        if (params.following)
            url += "following/";
        if (params.match)
            url += "matchlist/";
        if (params.authorName)
            url += "author/" + params.authorName + "/";
        if (params.groupby)
            url += "gby/" + params.groupby+"/";
        if (params.page)
            url += "p/"+params.page+"/";
        return url;
    }

    function setLocals(req, res, next) {
        res.locals.canonicalURL = canonicalURL;
        res.locals.params = req.params;
        res.locals.genurl = function (obj1, obj2) {
            return canonicalURL(_.extend({}, obj1, obj2));
        };
        next();
    }

    function constructVideoPagingQuery(page, pageSize) {
        return Video.find({}).skip((page-1)*pageSize).limit(pageSize)
            .sort('-published');
    }
    function doQuery(req, res, next) {
        req.query.exec(function (err, videos) {
            if (err) {
                res.render('exception', {
                    title: 'Oops, bad thing happens'
                });
            } else {
                _.map(videos, function (video) {
                    video.formattedPublished = (new moment(video.published)).format('YYYY/MM/DD');
                });
                req.videos = videos;
                next();
            }
        });
    }
};