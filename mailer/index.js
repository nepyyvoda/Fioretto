/**
 * Created by anton.nepyyvoda on 16.04.2015.
 */
var nodemailer = require('nodemailer');
var config = require('../config');
var extend = require('extend');
var log = require('../logger')(module);

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.get('mailer:user'),
        pass: config.get('mailer:pass')
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailDefaultOptions = {
    from: config.get('mailer:user')
};

function send(options, callback) {
    var settings = options;
    if(settings.to instanceof Array) {
        settings.to = (settings.to).join(', ');
    }
    extend(settings, mailDefaultOptions);
    transporter.sendMail(options, function(error, info){
        if(error){
            log.warn(error);
        }else{
            //info.rejected
            log.info('Mailer. Email sent: ' + info.response);
        }
        callback(error, info);
    });

}
//example
//send({
//    to: ['poison766@gmail.com', 'a.nepyyvoda@gmail.com'],
//    subject: 'Registration in Fioretto',
//    html: '<h2>You registration confirm code:</h2>'//text:
//}, function(error, info) {
//    if(error) {
//        console.log('error', error);
//    }
//    console.log('info', info)
//});

module.exports.send = send;