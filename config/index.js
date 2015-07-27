/**
 * Created by vitaliy on 23.07.15.
 */
var fs = require('fs');
var nconf = require('nconf');
var path = require('path');


fs.stat(path.join(__dirname, 'config.local.json'), function(err, stats) {
    if(err) {
        fs.stat(path.join(__dirname, 'config.json'), function(err, stats) {
            if(err) {
                console.error('Config was not found!');
            } else {
                nconf.argv()
                    .env()
                    .file({file: path.join(__dirname, 'config.local.json')});
            }
        });
    } else {
        nconf.argv()
            .env()
            .file({file: path.join(__dirname, 'config.local.json')});
    }
});

module.exports = nconf;