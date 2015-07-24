/**
 * If this code works, it was written by Vitaliy Kovalchuk. If not, I don’t know who wrote it.
 */

var config = require('../config');

var fs = require('fs');
var log = require('../logger')(module);
var cp = require('child_process');
var countryRegexp = new RegExp("{.?.?}\/?","gmi");
var commandToStartTor= "tor";
var rootCommand = "sudo";
var getPortByCountry = function (pattern) {

    var countryData = config.get('vpn:countries');
    for(var country in countryData) {
        var country = config.get('vpn:countries:' + country);
        if(country.pattern.match(pattern)){
            return country.port;
        }
    }

    return  countryData.default.port;
};

var startTor = function () {

    var countryData = config.get('vpn:countries');
    var torFileName = config.get('vpn:fileName');
    var torFolderPath = config.get('vpn:path');
    if(config.get('vpn:environment').indexOf("production")>=0){
        commandToStartTor = rootCommand + " " + commandToStartTor;
    }

    //for(var country in countryData) {
    //
    //    var countryProperties = config.get('vpn:countries:' + country);
    //
    //    var port = countryProperties.port;
    //    var pattern = countryProperties.pattern;
    //    var fullPath = torFolderPath + country + "/" ;
    //    var torConfigFilePath = fullPath + torFileName;
    //
    //    if (!fs.existsSync(torFolderPath)) {
    //        fs.mkdirSync(torFolderPath);
    //
    //    }if (!fs.existsSync(fullPath)) {
    //        fs.mkdirSync(fullPath);
    //    }
    //
    //    if (!fs.existsSync(torConfigFilePath)) {
    //        fs.writeFileSync(torConfigFilePath, {flag: 'wx'});
    //    }
    //
    //    var settings;
    //
    //    if (pattern.match(/{}/gmi)) {
    //        settings = "DataDirectory "+ fullPath +"\nSocksPort "
    //            + port + "\n";
    //    } else {
    //        settings = "ExitNodes " + pattern + "\nStrictNodes 1\nDataDirectory "+ fullPath +"\nSocksPort "
    //            + port + "\n";
    //    }
    //
    //    fs.writeFileSync(torConfigFilePath, settings, 'utf8');
    //
    //    var torProcess = cp.spawn('tor', ['-f', torConfigFilePath]);
    //
    //    torProcess.stdout.on('data', function(data) {
    //        console.log(data.toString('utf-8'));
    //        log.info(data.toString('utf-8'));
    //    });
    //
    //    torProcess.stderr.on('data', function(data) {
    //
    //        console.log(data.toString('utf-8'));
    //        log.error(data.toString('utf-8'));
    //    });
    //    torProcess.on('close', function(code) {
    //        log.info("Tor close with code " + code)
    //    });
    //}
};

function addProxySettings (request){

    var url =decodeURIComponent(request.url).replace(countryRegexp , "");
    var proxyHost = config.get('vpn:proxyHost');
    var country;

    if(decodeURIComponent(request.url).match(countryRegexp)){

        country = decodeURIComponent(request.url).match(countryRegexp);

        request.socksPort = getPortByCountry(country);

    } else {

        request.socksPort = getPortByCountry("{}");
    }
    request.url = url;
    request.headers.connection = "keep-alive";

}
module.exports.startTor = startTor;
module.exports.addProxySettings = addProxySettings;
