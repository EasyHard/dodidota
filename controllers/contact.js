var secrets = require('../config/secrets');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport('SMTP', {
 // service: 'Mailgun',
 // auth: {
 //   user: secrets.mailgun.login,
 //   pass: secrets.mailgun.password
 // }
 service: 'QQ',
 auth: {
   user: '278065913@qq.com',
   pass: '1'
 }

  // service: 'SendGrid',
  // auth: {
  //      user: secrets.sendgrid.user,
  //      pass: secrets.sendgrid.password
  // }
});

/**
 * GET /contact
 * Contact form page.
 */

exports.getContact = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 * @param email
 * @param name
 * @param message
 */

exports.postContact = function(req, res) {
  req.assert('name', '名字不应该为空。').notEmpty();
  req.assert('email', '邮件地址不应该为空。').isEmail();
  req.assert('message', '正文不应该为空。').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  var from = req.body.email;
  var name = req.body.name;
  var body = req.body.message;
  var to = 'liuzhiyou.cs@gmail.com';
  var subject = '[DodiDota] ' + from;

  var mailOptions = {
    to: to,
    from: '278065913@qq.com',
    subject: subject,
    text: body + '\n\n' + name
  };

  smtpTransport.sendMail(mailOptions, function(err) {
    if (err) {
      req.flash('errors', { msg: err.message });
      return res.redirect('/contact');
    }
    req.flash('success', { msg: '邮件已被成功发送！' });
    res.redirect('/contact');
  });
};
