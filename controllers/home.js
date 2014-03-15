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
exports.checkUser = function (req, res, next) {
    if (req.user === undefined) {
        res.render('account/login', {
            hint: '还没有登录，请先登录或<a href="/signup">注册</a>。',
            title: 'Login',
            captcha: genCaptcha(req, res)
        });
    } else {
        next();
    }
};

// toggle following list
exports.togglefollowing = function (req, res) {
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
    Author.find(function (err, authors) {
        if (err) {
            res.render('exception', {title: err.toString()});
            return;
        }
        res.render('authors', {title: 'Authors',
                               authors: authors,
                               req: req});
    });
};

