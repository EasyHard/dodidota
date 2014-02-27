var Video = require('../models/Video');

/**
 * GET /vedio/:id
 * video page.
 */
exports.showVideoDetail = function(req, res) {
    var id = req.params.id;
    Video.findById(id, function (err, video) {
        if (err) {
            res.render('exception', {
                title: 'Oops, this video seems invalid.'
            });
        } else {
            // http://v.youku.com/v_show/id_XNjc0ODM2MDM2.html -> XNjc0ODM2MDM2
            var video_id = video.link.substring(29).replace('.html', '');
            var frameSrc = "http://player.youku.com/embed/" + video_id;
            var embedSrc = "http://player.youku.com/player.php/sid/" + video_id + "/v.swf";
            res.render('videoDetail', {
                title: video.title,
                video: video,
                frameSrc: frameSrc,
                embedSrc: embedSrc
            });
        }
    });
};
