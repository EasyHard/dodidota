'use strict';

module.exports = function(cb) {
    var mongoose = require('mongoose');
    var secrets = require('../config/secrets');
    var _ = require('underscore');

    mongoose.connect(secrets.db);
    var db = mongoose.connection;
    db.on('error', function() {
        console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
    });
    db.once('open', function() {
        cb(function() {
            mongoose.disconnect();
        });
    });
};