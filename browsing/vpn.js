/**
 * If this code works, it was written by Vitaliy Kovalchuk. If not, I don’t know who wrote it.
 */

var config = require('../config');
var wrapper = require('socks-wrapper')

var fs = require('fs');
var log = require('../logger')(module);
var cp = require('child_process');
var countryRegexp = new RegExp("{.?.?}\/?","gmi");
var noProxyNeededPattern = new RegExp("{n}","gmi");
var URL = require('url');

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

    for(var country in countryData) {

        var countryProperties = config.get('vpn:countries:' + country);

        var port = countryProperties.port;
        var pattern = countryProperties.pattern;
        var fullPath = torFolderPath + country + "/" ;
        var torConfigFilePath = fullPath + torFileName;

        if (!fs.existsSync(torFolderPath)) {
            fs.mkdirSync(torFolderPath);

        }if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath);
        }

        if (!fs.existsSync(torConfigFilePath)) {
            fs.writeFileSync(torConfigFilePath, {flag: 'wx'});
        }

        var settings;

        if (pattern.match(/{}/gmi)) {
            settings = "DataDirectory "+ fullPath +"\nSocksPort "
                + port + "\n";
        } else {
            settings = "ExitNodes " + pattern + "\nStrictNodes 1\nDataDirectory "+ fullPath +"\nSocksPort "
                + port + "\n";
        }

        fs.writeFileSync(torConfigFilePath, settings, 'utf8');

        var torProcess = cp.spawn('tor', ['-f', torConfigFilePath]);

        torProcess.stdout.on('data', function(data) {
            console.log(data.toString('utf-8'));
            log.info(data.toString('utf-8'));
        });

        torProcess.stderr.on('data', function(data) {

            console.log(data.toString('utf-8'));
            log.error(data.toString('utf-8'));
        });
        torProcess.on('close', function(code) {
            log.info("Tor close with code " + code)
        });
    }
};

var getSocksAgent = function (proxyHost, country, protocol){
    if(protocol.indexOf("https")>=0){
        return new wrapper.HttpsAgent(getPortByCountry(country), proxyHost);
    }else {
        return new wrapper.HttpAgent(getPortByCountry(country), proxyHost);
    }
};
function addProxySettings (request){

    var url =decodeURIComponent(request.url).replace(countryRegexp , "");
    var proxyHost = config.get('vpn:proxyHost');
    var country;
    var uri = URL.parse(url);
    if(decodeURIComponent(request.url).match(countryRegexp)){
        country = decodeURIComponent(request.url).match(countryRegexp);
        if(!country.toString().match(noProxyNeededPattern)){
            request.agent = getSocksAgent(proxyHost, country, uri.protocol);
        }else {
            request.agent = undefined;
        }
    } else {
        country = "{}";
        request.agent = getSocksAgent(proxyHost, country, uri.protocol);
    }
    request.url = url;
    request.headers.connection = "close";

}
module.exports.startTor = startTor;
module.exports.addProxySettings = addProxySettings;
