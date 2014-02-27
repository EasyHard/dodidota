"use strict";
var youku = require('../libs/youku');
var assert = require('chai').assert;
describe('Youku', function () {
    it('getInformation', function (done) {
        var link = "http://v.youku.com/v_show/id_XNjc1NTA0MTQ4.html";
        youku.getInformation(link, function (err, post) {
            assert.isNull(err, 'error');
            assert.equal(post.link, link);
            assert.equal(post.title, "老鼠DOTA2《教你带节奏系列》蓝猫和敌法");
            assert.equal(post.author, "老鼠sjq");
            done();
        });
    });

    // it('getVideoListByAuthor', function (done) {
    //     var vediolist = youku.getVideoListByAuthor('张登溶_nada');
    // });
});