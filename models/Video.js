'use strict';
/**
 * Post of video.
 **/

var mongoose = require('mongoose');
var util = require('util');
var request = require('request');
var extrasite = require('../libs/extrasite');
var videoSchema = new mongoose.Schema({
    link: { type: String, unique: true },
    title: { type: String},
    formattedTitle: {type: String},
    author: [{ name: String, cname: String}],
    updateAt: { type: Date, default: Date.now },
    published: { type: Date, index: true},
    duration: { type: Number}
});

/**
 * Renew updateAt when saving.
 */
videoSchema.pre('save', function(next) {
    this.markModified('updateAt');
    this.updateAt = Date.now();
    return next();
});

module.exports = mongoose.model('Video', videoSchema);