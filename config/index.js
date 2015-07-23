/**
 * Created by vitaliy on 23.07.15.
 */
var fs = require('fs');
var nconf = require('nconf');
var path = require('path');

fs.open('config.local.json', 'r', function(err, fd){
    if(err !== null){
        if(err.code === 'ENOENT'){
            console.log("Can't open  : config.local.json - not exist", err.code );
            fs.open('config.json', 'r', function(err, fd){
                if(err !== null){
                    if(err.code === 'ENOENT'){
                        console.log("Can't open  : config.json - not exist", err.code );
                    } else {
                        console.log("Can't open  : config.json ", err.code);
                    }
                } else {
                    nconf.argv()
                        .env()
                        .file({file: path.join(__dirname, 'config.json')});

                    module.exports = nconf;
                }
            });
        } else {
            console.log("Can't open  : config.local.json code = ", err.code);
        }
    } else {
        nconf.argv()
            .env()
            .file({file: path.join(__dirname, 'config.json')});

        module.exports = nconf;
    }
});
