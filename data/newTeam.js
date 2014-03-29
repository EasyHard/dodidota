'use strict';
var async = require('async');
var _ = require('underscore');
var Team = require('../models/Team');
var t = require(process.argv[2]);
require('./opendbonce')(function (cb) {
    if (t.alias.indexOf(t.name) === -1)
        t.alias.push('\\b'+t.name+'\\b');
    var team = new Team(t);
    team.save(function (err) {
        if (err) {
            console.log(err);
        }
        cb();
    });
});