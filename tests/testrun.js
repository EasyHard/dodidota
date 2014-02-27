var youku = require('../libs/youku');
var util = require('util');
var videolist = youku.getVideoListByAuthor('张登溶_nada');
function f(videolist) {
    videolist.next(function (err, video) {
        if (err) {
            util.log('err:', err);
        } else {
            if (video) {
                util.log(video);
                f(videolist);
            }
        }
    });
}

f(videolist);
