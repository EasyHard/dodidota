'use strict';
var async = require('async');
var _ = require('underscore');
var Team = require('../models/Team');
var teams = _.map([
    { name: 'DK'},
    { name: 'IG'},
    { name: 'VG'},
    { name: 'LGD',
      alias: ['LGD.taobao']},
    { name: 'NewBee',
      alias: ['NB']},
    { name: 'DT'},
    { name: 'TongFu',
      alias: ['TF.Wz', 'TongFu.Wz', 'TF'] },
    { name: 'CIS'}
], function (team) {
    if (team.alias === undefined)
        team.alias = [];
    team.alias.push(team.name);
    return team;
});

require('./opendbonce')(function (cb) {
    async.eachSeries(teams, function(team, cb) {
        var mteam = new Team();
        _.extend(mteam, team).save(cb);
    }, function (err) {
        if (err) {
            console.log(err);
        }
        cb();
    });
});