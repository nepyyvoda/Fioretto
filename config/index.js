/**
 * Created by vitaliy on 23.07.15.
 */
var fs = require('fs');
var nconf = require('nconf');
var path = require('path');


var stats = fs.statSync(path.join(__dirname, 'config.local.json'));
if(!stats.isFile() && err) {
    var stats = fs.statSync(path.join(__dirname, 'config.json'));
    if(!stats.isFile() && err) {
        console.error('Config was not found!');
    } else {
        nconf.argv()
            .env()
            .file({file: path.join(__dirname, 'config.json')});
    }
} else {
    nconf.argv()
        .env()
        .file({file: path.join(__dirname, 'config.local.json')});
}

module.exports = nconf;