var captchagen = require('captchagen');

module.exports = function (req, res) {
    if (req.session.count > 5) {
        if (req.session.count > 6)
            req.session.count = 0;
        var c = captchagen.create({
            height: 160
        });
        c.generate();
        req.session.captcha = c.text;
        return c.uri();
    } else {
        return undefined;
    }
};