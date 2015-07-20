/**
 * If this code works, it was written by Vitaliy Kovalchuk. If not, I don’t know who wrote it.
 */

var config = require('../config');

var SocksProxyAgent = require('socks-proxy-agent');
var ProxySocket = require('proxysocket');
var wrapper = require('socks-wrapper')
var ProxySocket = require('proxysocket');

var fs = require('fs');
var log = require('../logger')(module);
var cp = require('child_process');
var countryRegexp = new RegExp("{.?.?}\/?","gmi");
var noProxyNeededPattern = new RegExp("{n}","gmi");

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
            console.log(data.toString('utf-8'))
            log.info(data.toString('utf-8'));
        });

        torProcess.stderr.on('data', function(data) {

            console.log(data.toString('utf-8'))
            log.error(data.toString('utf-8'));
        });
        torProcess.on('close', function(code) {
            log.info("Tor close with code " + code)
        });
    }
};

var getSocksAgent2 = function (proxyHost, country){
    return new SocksProxyAgent("socks://" + proxyHost + ":"+ getPortByCountry(country));
};

//var getSocksAgent = function (proxyHost, country){
//    return new ProxySocket(proxyHost, getPortByCountry(country));
//};
var getSocksAgent = function (proxyHost, country){
    return new wrapper.HttpAgent(getPortByCountry(country), proxyHost);
};
var getSocksAgent4 = function (proxyHost, country){
    return ProxySocket.createAgent(proxyHost,getPortByCountry(country) );
};

function addProxySettings (request){

    var url =decodeURIComponent(request.url).replace(countryRegexp , "");
    var proxyHost = config.get('vpn:proxyHost');
    var country;

    if(decodeURIComponent(request.url).match(countryRegexp)){
        country = decodeURIComponent(request.url).match(countryRegexp);
        if(!country.toString().match(noProxyNeededPattern)){

            request.agent = getSocksAgent(proxyHost, country);
        }else {
            request.agent = undefined;
        }
    } else {
        country = "{}";
        request.agent = getSocksAgent(proxyHost, country);
    }
    request.url = url;
    request.headers.connection = "close";

}

//var http = require('http');
//var https = require('https');
//var request = require('request');
//var URL = require('url-parse');
//var zlib = require('zlib');
//var replaceAllRelByAbs = require('../utils/').replaceAllRelByAbs;
//var aTagLinkAppender = require('../utils/aTagLinkAppender.js').aTagLinkAppender;
//var formLinkApender = require('../utils/formLinkAppender.js').formLinkApender;
//
//var iconv = require('iconv-lite');
//
//var proxyHost = config.get('vpn:proxyHost');
//var proxyPort = config.get('vpn:proxyPort');
//var servletPageLoaderPath = "/vpn?proxyUrl=";
//var resourceLoaderPath = "/vpn/get?proxyUrl=";
//var resourceLoaderController = "/vpn/get?";

//var regExpForUrl = new RegExp("(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\." +
//    "254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(" +
//    "?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*" +
//    "[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})" +
//    "))(?::\d{2,5})?(?:\/\S*)?", "gmi");
//

//var regExpForUrl = new RegExp(
//        // protocol identifier
//    "(?:(?:https?|ftp)://)" +
//        // user:pass authentication
//    "(?:\\S+(?::\\S*)?@)?" +
//    "(?:" +
//        // IP address exclusion
//        // private & local networks
//    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
//    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
//    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
//        // IP address dotted notation octets
//        // excludes loopback network 0.0.0.0
//        // excludes reserved space >= 224.0.0.0
//        // excludes network & broacast addresses
//        // (first & last IP address of each class)
//    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
//    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
//    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
//    "|" +
//        // host name
//    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
//        // domain name
//    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
//        // TLD identifier
//    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
//        // TLD may end with dot
//    ".?" +
//    ")" +
//        // port number
//    "(?::\\d{2,5})?" +
//        // resource path
//    "(?:[/?#]\\S*)?", "gmi"
//);

//var charsets = ["utf-8", "ucs2", "utf-16le", "utf-16", "ascii", "binary", "base64", "hex", "utf-16be", "utf-16", "cp-874", "win-874",
//    "windows-874", "cp-1250", "win-1250", "windows-1250", "cp-1251", "win-1251", "windows-1251", "cp-1252", "win-1252",
//    "windows-1252", "cp-1253", "win-1253", "windows-1253", "cp-1254", "win-1254", "windows-1254", "cp-1255", "win-1255",
//    "windows-1255", "cp-1256", "win-1256", "windows-1256", "cp-1257", "win-1257", "windows-1257", "cp-1258", "win-1258",
//    "windows-1258", "iso-8859-1", "iso-8859-2", "iso-8859-3", "iso-8859-4", "iso-8859-5", "iso-8859-6", "iso-8859-7",
//    "iso-8859-8", "iso-8859-9", "iso-8859-10", "iso-8859-11", "iso-8859-12", "iso-8859-13", "iso-8859-14", "iso-8859-15",
//    "iso-8859-16", "cp-437", "cp-737", "cp-775", "cp-808", "cp-850", "cp-852", "cp-855", "cp-856", "cp-857", "cp-858", "cp-860",
//    "cp-561", "cp-562", "cp-563", "cp-564", "cp-565", "cp-866", "cp-869", "cp-922", "cp-1046", "cp-1124", "cp-1125", "cp-1129",
//    "cp-1133", "cp-1161", "cp-1162", "cp-1163", "ibm-437", "ibm-737", "ibm-775", "ibm-808", "ibm-850", "ibm-852", "ibm-855",
//    "ibm-856", "ibm-857", "ibm-858", "ibm-860", "ibm-561", "ibm-562", "ibm-563", "ibm-564", "ibm-565", "ibm-866", "ibm-869",
//    "ibm-922", "ibm-1046", "ibm-1124", "ibm-1125", "ibm-1129", "ibm-1133", "ibm-1161", "ibm-1162", "ibm-1163", "maccroatian",
//    "maccyrillic", "macgreek", "maciceland", "macroman", "macromania", "macthai", "macturkish", "macukraine", "maccenteuro",
//    "macintosh", "koi8-r", "koi8-u", "koi8-ru", "koi8-t", "armscii8", "rk1048", "tcvn", "georgianacademy", "georgianps", "pt154",
//    "viscii", "iso646cn", "iso646jp", "hproman8", "tis620", "shift_jis", "windows--31j", "windows-932", "euc-jp", "gb2312", "gbk",
//    "gb18030", "windows-936", "euc-cn", "ks_c_5601", "windows-949", "euc-kr", "big5", "big5-hkscs", "windows-950"];

//function searchStringInArray(str, strArray) {
//
//    for (var j = 0; j < strArray.length; j++) {
//        if (strArray[j].match(str)) return true;
//    }
//    return false;
//}

//var replaceLinks = function (html) {
//
//    var matches = html.match(regExpForUrl);
//    if(matches == null){
//        return html;
//    } else {
//        matches.forEach(function (match) {
//            html.replace(/match/gmi, resourceLoaderPath + match)
//        });
//        return html;
//    }
//};

//var getPageCharset = function (htmlPage, headers) {
//
//    var redExp = new RegExp(/charset=.[A-Za-z0-9-]*/g);
//    var htmlMatch = htmlPage.match(redExp);
//    var headersMatch = headers.toString().match(redExp);
//    var DetectIfStringContainCharset = 9;
//
//    var tmp;
//
//    if (htmlMatch != null && htmlMatch != undefined && htmlMatch[0].length > DetectIfStringContainCharset) {
//        htmlMatch = htmlMatch[0];
//        if (htmlMatch.indexOf('"') >= 0) {
//            return htmlMatch.replace('charset="', "");
//        } else if (htmlMatch.indexOf("'") >= 0) {
//            return htmlMatch.replace("charset='", "");
//        } else {
//            return htmlMatch.replace("charset=", "");
//        }
//
//    } else if (headersMatch != null && headersMatch != undefined && headersMatch[0].length > DetectIfStringContainCharset) {
//        headersMatch = headersMatch[0];
//        if (headersMatch.indexOf('"') >= 0) {
//            tmp = headersMatch.replace('charset="', "");
//            if (searchStringInArray(tmp.toLowerCase(), charsets)) {
//                return tmp;
//            } else {
//                return false;
//            }
//        } else if (headersMatch.indexOf("'") >= 0) {
//            tmp = headersMatch.replace("charset='", "");
//            if (searchStringInArray(tmp.toLowerCase(), charsets)) {
//                return tmp;
//            } else {
//                return false;
//            }
//        } else {
//            tmp = headersMatch.replace("charset=", "");
//            if (searchStringInArray(tmp.toLowerCase(), charsets)) {
//                return tmp;
//            } else {
//                return false;
//            }
//        }
//    } else {
//        return false;
//    }
//};

//var requestWithEncoding = function (options, callback) {
//
//    var requestToServer = request(options);
//
//    requestToServer.on('response', function (response) {
//        var chunks = [];
//        response.on('data', function (chunk) {
//            chunks.push(chunk);
//        });
//
//        response.on('end', function () {
//            var buffer = Buffer.concat(chunks);
//            var headers = response.headers;
//            var encoding = response.headers['content-encoding'];
//            //console.log(buffer.toString());
//            if (encoding == 'gzip') {
//                zlib.gunzip(buffer, function (err, decoded) {
//
//                    var charset = getPageCharset(decoded.toString(), headers);
//
//                    if (charset != false) {
//                        var str = iconv.decode(decoded, charset);
//                        callback(err, str && str.toString(), headers);
//                    } else {
//                        callback(err, decoded && decoded.toString(), headers);
//                    }
//                });
//            } else if (encoding == 'deflate') {
//                zlib.inflate(buffer, function (err, decoded) {
//
//                    var charset = getPageCharset(decoded.toString(), headers);
//
//                    if (charset != false) {
//                        var str = iconv.decode(decoded, charset);
//                        callback(err, str && str.toString(), headers);
//                    } else {
//                        callback(err, decoded && decoded.toString(), headers);
//                    }
//                })
//            } else {
//
//                var charset = getPageCharset(buffer.toString(), headers);
//
//                if (charset != false) {
//
//                    var str = iconv.decode(buffer.toString(), charset);
//                    callback(null, str && str.toString(), headers);
//
//                } else {
//
//                    callback(null, buffer.toString(), headers);
//
//                }
//
//            }
//        });
//    });
//    requestToServer.on('error', function (err) {
//        callback(err);
//        requestToServer.end();
//    });
//    requestToServer.end();
//};
//
//var paigeLoader = function (req, res ,port) {
//
//    var url = new URL(req.query.proxyUrl);
//
//    var href = url.protocol + '//' + url.host;
//
//    var getOptions = function (protocol, url, port) {
//
//        var Agent;
//
//        if (protocol == "http:") {
//            Agent = require('socks5-http-client/lib/Agent');
//        } else {
//            Agent = require('socks5-https-client/lib/Agent');
//        }
//
//        var headers = {
//            "accept-charset": "utf-8;q=0.7,*;q=0.3",
//            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
//            "user-agent": req.headers['user-agent'],
//            "accept-encoding": "gzip,deflate",
//            "connection": 'close'
//        };
//        return {
//            method: 'GET',
//            url: url,
//            agentClass: Agent,
//            headers: headers,
//            agentOptions: {
//                socksHost: proxyHost,
//                socksPort: port
//            }
//        };
//    };
//
//    requestWithEncoding(getOptions(url.protocol, url.href, port), function (err, data, headers) {
//
//        if (headers != undefined) {
//            headers['content-encoding'] = null;
//            res.set(headers);
//        }
//        var XMLHttpRequestOverride = '<head> \n<script type="text/javascript">\n(function() { ' +
//            'var proxied = window.XMLHttpRequest.prototype.open;\nwindow.XMLHttpRequest.prototype.open = function() ' +
//            '{ arguments[1] = "' + resourceLoaderController + "href=" + href + "&proxyUrl=" + '" + arguments[1]  ;return proxied.apply(this, ' +
//            '[].slice.call(arguments));};})();\n</script>'.toString();
//
//        if (data != undefined && data != null) {
//
//            data = replaceLinks(data);
//            data = data.replace("<head>", XMLHttpRequestOverride);
//            data = data.replace(/url\(\//g, "url(" + resourceLoaderPath + url.protocol + "//" + url.host + "/");
//            data = aTagLinkAppender(data, servletPageLoaderPath, href);
//            data = replaceAllRelByAbs(data, resourceLoaderPath, href);
//            data = formLinkApender(data,resourceLoaderController + "href=" + href + "&proxyUrl=" , href);
//
//            res.send(data);
//            return res;
//        }
//    });
//
//};
//
//var resourceLoader = function (req, res) {
//    var url =new URL(req.url.replace("/vpn/get?proxyUrl=" , ""));
//    var getOptions = function (protocol) {
//
//        var Agent;
//        if (protocol == "http:") {
//            Agent = require('socks5-http-client/lib/Agent');
//        } else {
//            Agent = require('socks5-https-client/lib/Agent');
//        }
//        return {
//            method: 'GET',
//            url: url.href,
//            agentClass: Agent,
//            timeout: 10000,
//            headers: {
//                connection: 'close'
//            },
//            agentOptions: {
//                socksHost: proxyHost,
//                socksPort: proxyPort
//            }
//        };
//    };
//
//    var options = getOptions(url.protocol);
//
//    var href = url.protocol + "//" + url.href;
//
//
//    try {
//
//        if (href.toLowerCase().indexOf(".jpg")  >= 0 ||
//            href.toLowerCase().indexOf(".gif")  >= 0 ||
//            href.toLowerCase().indexOf(".png")  >= 0 ||
//            href.toLowerCase().indexOf(".jpeg") >= 0 ||
//            href.toLowerCase().indexOf(".ico")  >= 0 ||
//            href.toLowerCase().indexOf(".svg")  >= 0) {
//
//            request.get(options)
//                .on('error', function (err) {
//                    console.log(err);
//                })
//                .pipe(res);
//            return res;
//
//        } else {
//            requestWithEncoding(options, function (err, data, headers) {
//
//                if (headers != undefined) {
//                    headers['content-encoding'] = null;
//                    res.set(headers);
//                }
//
//                if (data != undefined && data != null) {
//
//                    data = replaceLinks(data);
//                    data = data.replace(/url\(\//g, "url(" + resourceLoaderPath + url.protocol + "//" + url.host + "/");
//                    data = aTagLinkAppender(data, servletPageLoaderPath, href);
//                    data = replaceAllRelByAbs(data, resourceLoaderPath, href);
//                    data = formLinkApender(data,resourceLoaderController + "href=" + href + "&proxyUrl=" , href);
//
//                    res.send(data);
//                    return res;
//                }
//            });
//        }
//    } catch (err) {
//        console.log(err);
//    }
//
//};
//
//var postLoader = function (req, res) {
//
//    var url = new URL(req.query.proxyUrl);
//    var href = new URL(req.query.href);
//
//    if (url.href.indexOf("http") < 0) {
//
//        if (url.href.indexOf("///") === 0) {
//            url = new URL(href + url.href.replace("///", "/"));
//        } else if (url.href.indexOf("//") == 0) {
//            url = new URL("https:" + url);
//        } else {
//            url = new URL(href + url);
//        }
//    }
//
//
//    var getOptions = function (protocol, data) {
//
//        var Agent;
//        if (protocol == "http:") {
//            Agent = require('socks5-http-client/lib/Agent');
//        } else {
//            Agent = require('socks5-https-client/lib/Agent');
//        }
//
//        return {
//            method: "POST",
//            url: url.href,
//            agentClass: Agent,
//            timeout: 10000,
//            headers: {connection: "close"},
//            form: data,
//            agentOptions: {
//                socksHost: proxyHost,
//                socksPort: proxyPort
//            }
//        };
//    };
//
//    var options = getOptions(url.protocol, req.body);
//
//    requestWithEncoding(options, function (err, data, headers) {
//        if (headers != undefined) {
//            headers['content-encoding'] = null;
//            res.set(headers);
//        }
//
//        if (data != undefined && data != null) {
//
//            data = replaceLinks(data);
//            data = data.replace(/url\(\//g, "url(" + resourceLoaderPath + url.protocol + "//" + url.host + "/");
//            data = aTagLinkAppender(data, servletPageLoaderPath, href);
//            data = replaceAllRelByAbs(data, resourceLoaderPath, href);
//            data = formLinkApender(data,resourceLoaderController + "href=" + url.host + "&proxyUrl=" , href);
//
//            res.send(data);
//
//            return res;
//        }
//    });
//};

//var torStart = function (callback) {
//
//    torProc = cp.spawn('tor', ['-f', torPath + torConfigFileName]);
//    torProc.stdout.on('data', function(data) {
//        console.log(data.toString('utf-8'));
//        if(data.toString("utf-8").indexOf("Bootstrapped 100%: Done")>=0){
//            callback();
//        }
//    });
//    torProc.stderr.on('data', function(data) {
//        console.log(data.toString('utf-8'));
//    });
//
//    torProc.on('close', function(code) {
//        console.log("Tor is stop");
//    });
//    //callback();
//};

//var torStop = function () {
//    if(torProc != undefined && torProc != null) {
//        torProc.kill();
//        torProc = undefined;
//    }
//};
//
//var torCountryConfig = function (country,callback) {
//
//    if(!fs.existsSync(torPath)){
//        fs.mkdirSync(torPath);
//    }
//
//    if(!fs.existsSync(torPath + torConfigFileName)){
//        fs.writeFileSync(torPath + torConfigFileName, {flag: 'wx'});
//    }
//
//
//    var settings = torDefaultTemplate;
//
//    var configText = fs.readFileSync(torPath + torConfigFileName, {encoding: 'utf8'});
//
//    if (configText.indexOf(country) < 0 && country.length > 3) {
//        torStop();
//    } else {
//        callback();
//    }
//
//    if (searchStringInArray(country.toLowerCase(), availableCountries)) {
//        settings = torCountryTemplate.replace(/\{country\}/gmi, country) + settings;
//    }
//
//    fs.writeFileSync(torPath + torConfigFileName, settings, 'utf8');
//
//    if(torProc == undefined || torProc == null) {
//        torStart(function () {
//            callback();
//        });
//    }
//
//};

//module.exports.paigeLoader = paigeLoader;
//module.exports.getPortByCountry = getPortByCountry;
//module.exports.torCountryConfig = torCountryConfig;
//module.exports.resourceLoader = resourceLoader;
//module.exports.postLoader = postLoader;

module.exports.startTor = startTor;
module.exports.addProxySettings = addProxySettings;
