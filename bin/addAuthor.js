'use strict';

var Author = require('../models/Author');
var async = require('async');
var mongoose = require('mongoose');
var secrets = require('../config/secrets');
mongoose.connect(secrets.db);
var db = mongoose.connection;
db.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});


db.once('open', function () {
    var xiwa = new Author({
        name : "西瓦幽鬼",
        site : "Youku",
        nicknames: [],
        defaultGametype: "dota2"
    });


    var xg = new Author({
        name: "GuAi小乖",
        site: "Youku",
        nicknames: ["小乖"],
        defaultGametype: "dota1"
    });

    var bg = new Author({
        name: "宝哥ZippO",
        site: "Youku",
        nicknames: ["宝哥", "zhou宝龙"],
        defaultGametype: "dota2"
    });

    var lgdgaming = new Author({
        name: "LGD-GAMING",
        site: "Youku",
        nicknames: [],
        defaultGametype: "dota2"
    });

    var list = [xiwa, xg, bg, lgdgaming];
    async.eachSeries(list, function (author, cb) {
        console.log('saving ', author);
        author.save(function (err) {
            console.log('cb of save');
            if (err) {
                console.log('err on save', err.toString());
            }
            cb();
        }, function (err) {
            if (err)
                console.log(err.toString());
            console.log('done');
            mongoose.disconnect();
        });
    });
});



