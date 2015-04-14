/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
var winston = require('winston');
var config = require('../config');

function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение

    return new winston.Logger({
        transports : [
            //new winston.transports.Console({
            //    colorize:   true,
            //    level:      'debug',
            //    label:      path
            //}),
            new (winston.transports.File)({
                level: config.get('loglvl'),
                filename: 'log.log'
            })
        ]
    });
}

module.exports = getLogger;