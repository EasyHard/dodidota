'use strict';
/**
 * Post of video.
 **/

var mongoose = require('mongoose');
var util = require('util');
var request = require('request');
var extrasite = require('../libs/extrasite');
var Team = require('./Team');
var _ = require('underscore');
var videoSchema = new mongoose.Schema({
    link: { type: String, unique: true },
    title: { type: String},
    authorName: {type: String},
    updateAt: { type: Date, default: Date.now },
    published: { type: Date, index: true},
    duration: { type: Number},
    gametype: { type: String, default: "dota1"},
    match: {
        manuallySet: { type: Boolean, default: "false"},
        type: {type: String, default: "notset"}
    }
});

/**
 * Renew updateAt when saving.
 */
videoSchema.pre('save', function(next) {
    this.markModified('updateAt');
    this.updateAt = Date.now();
    return next();
});

videoSchema.methods.containsTeam = function (team) {
    var video = this;
    if (this.match.type === 'notset' || this.match.type === 'notamatch')
        return false;
    var aliasContain = _.map(team.alias, function(alias) {
        return Boolean(video.title.match(new RegExp(alias, "i")));
    });
    return _.reduce(aliasContain, function(memo, now) {return memo || now;}, false);
};

module.exports = mongoose.model('Video', videoSchema);