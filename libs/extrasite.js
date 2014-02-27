/**
 * Dispather and interface of extra video site.
 * Currently only support youku.
 **/

'use strict';

var youku = require('./youku');

module.exports = {
    /**
     * Retrieve basic infomation of a video by a link.
     */
    getInformation: function (link, cb) {
        youku.getInformation(link, cb);
    },

    /**
     * Return a VideoList by name and site
     */
    getVideoListByAuthor: function (name, options, site) {
        return youku.getVideoListByAuthor(name, options);
    }
};