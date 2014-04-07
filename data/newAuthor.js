'use strict';
var async = require('async');
var _ = require('underscore');
var Author = require('../models/Author');
var t = require(process.argv[2]);
require('./opendbonce')(function (cb) {
    var author = new Author(t);
    if (!_.contains(author.nicknames, author.name))
        author.nicknames.push(author.name);
    author.save(cb);
});