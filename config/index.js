/**
 * Created by vitaliy on 23.07.15.
 */
var fs = require('fs');
var nconf = require('nconf');
var path = require('path');

try{
    fs.openSync(path.join(__dirname, 'config.local.json'), 'r');
    nconf.argv()
        .env()
        .file({file: path.join(__dirname, 'config.local.json')});
} catch (err){
    try{
        fs.openSync(path.join(__dirname, 'config.json'), 'r');
        nconf.argv()
            .env()
            .file({file: path.join(__dirname, 'config.json')});
    } catch (err){
        console.log(err);
    }
    console.log(err);
}

module.exports = nconf;