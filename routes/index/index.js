/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
var express = require('express');
var router = express.Router();
var config = require('../../config');
var Paypal = require('../../controllers/paypal');
var User = require('../../controllers/user');
var jwt = require('jsonwebtoken');

function isLogged(sid, callback) {
    var token = sid;
    jwt.verify(token, 'secret', function (err, decoded) {
        if (decoded) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

function checkAuth(req, res, next) {
    var token = req.cookies.sid;
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err || !decoded) {
            res.cookie('sid', '', {httpOnly: true});
            res.redirect('/login');
            return;
        }
        next();
    });
}
/* GET home page. */
router.get('/', function (req, res) {
    isLogged(req.cookies.sid, function(state) {
        if(state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/index', {title: 'Fioretto', layout: false, name: req.path});
        }
    });
});
router.get('/profile', checkAuth, function (req, res) {
    res.render('index/profile', {title: 'Profile', name: req.path});
});
router.get('/pay_methods', checkAuth, function (req, res) {
    res.render('index/pay_methods', {title: 'Pay methods', name: req.path});
});
router.get('/registration', function (req, res) {
    isLogged(req.cookies.sid, function(state) {
        if(state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/registration', {title: 'Registration', layout: false, name: req.path});
        }
    });
});
router.get('/login', function (req, res) {
    isLogged(req.cookies.sid, function(state) {
        if(state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/login', {title: 'Login form', layout: false, name: req.path});
        }
    });
});
router.get('/password_recovery', function (req, res) {
    isLogged(req.cookies.sid, function(state) {
        if(state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/password_recovery', {title: 'Password recovery', layout: false, name: req.path});
        }
    });
});
router.get('/new_pass', function (req, res) {
    res.render('index/new_pass', {title: 'New password', layout: false, name: req.path});
});
router.get('/social_networks', function (req, res) {
    res.render('index/social_networks', {title: 'Social networks', layout: false, name: req.path});
});
router.get('/interface', checkAuth, function (req, res) {
    res.render('index/interface', {title: 'Interface', name: req.path});
});
router.get('/client_payment', checkAuth, function (req, res) {
    res.render('index/client_payment', {title: 'Client Payment', name: req.path});
});
router.get('/registration/:hash', function (req, res) {
    User.registerConfirm(req, res);
});
router.get('/logout', checkAuth, function (req, res) {
    User.logout(req, res);
});
router.get('/pay', checkAuth, function (req, res) {
    res.redirect('/profile');
});
router.post('/pay/ipn', function (req, res) {
    Paypal.ipn_processor(req, res);
});
router.get('/scenaries', checkAuth, function(req, res) {
    res.render('index/scenaries', { title: 'Scenaries', name: req.path});
});

var http = require('http');
var https = require('https');
var request = require('request');
var URL = require('url-parse');
var zlib = require('zlib');
var replaceAllRelByAbs = require('../../utils/').replaceAllRelByAbs;
var aTagLinkAppender = require('../../utils/aTagLinkAppender.js').aTagLinkAppender;
var iconv = require('iconv-lite');

var proxyHost = config.get('vpn:proxyHost');
var proxyPort = config.get('vpn:proxyPort');
var servletPageLoader = "/vpn?url=";
var resourceLoader = "/vpnget?url=";

router.get('/vpn', checkAuth, function (req, res) {

    var url = new URL(req.query.url);

    var getPageCharset = function (htmlPage, headers) {

        var redExp = new RegExp(/charset=.[A-Za-z0-9-]*/g);

        var htmlMatch = htmlPage.match(redExp);
        var headersMatch = headers.toString().match(redExp);

        var DetectIfStringContainCharset = 8;

        if (htmlMatch != null && htmlMatch != undefined && htmlMatch[0].length > DetectIfStringContainCharset) {
            htmlMatch = htmlMatch[0];
            if (htmlMatch.indexOf('"') >= 0) {
                return htmlMatch.replace('charset="', "");
            } else if (htmlMatch.indexOf("'") >= 0) {
                return htmlMatch.replace("charset='", "");
            } else {
                return htmlMatch.replace("charset=", "");
            }

        } else if (headersMatch != null && headersMatch != undefined && headersMatch[0].length > DetectIfStringContainCharset) {
            headersMatch = headersMatch[0];
            if (headersMatch.indexOf('"') >= 0) {
                return headersMatch.replace('charset="', "");
            } else if (headersMatch.indexOf("'") >= 0) {
                return headersMatch.replace("charset='", "");
            } else {
                return headersMatch.replace("charset=", "");
            }
        } else {
            return false;
        }
    };

    var getOptions = function (protocol, url) {

        var Agent;

        if (protocol == "http:") {
            Agent = require('socks5-http-client/lib/Agent');
        } else {
            Agent = require('socks5-https-client/lib/Agent');
        }

        var headers = {
            "accept-charset": "utf-8;q=0.7,*;q=0.3",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "user-agent": req.headers['user-agent'],
            "accept-encoding": "gzip,deflate",
            "connection": 'close'
        };


        return {
            url: url,
            agentClass: Agent,
            headers: headers,
            agentOptions: {
                socksHost: proxyHost,
                socksPort: proxyPort
            }
        };
    };

    var requestWithEncoding = function (options, callback) {

        var vpnReq = request.get(options);

        vpnReq.on('response', function (vpnRes) {
            var chunks = [];
            vpnRes.on('data', function (chunk) {
                chunks.push(chunk);
            });

            vpnRes.on('end', function () {
                var buffer = Buffer.concat(chunks);
                var headers = vpnRes.headers;
                var encoding = vpnRes.headers['content-encoding'];
                if (encoding == 'gzip') {
                    zlib.gunzip(buffer, function (err, decoded) {

                        var charset = getPageCharset(decoded.toString(), headers);

                        if (charset != false) {
                            var str = iconv.decode(decoded, charset);
                            callback(err, str && str.toString(), headers);
                        } else {
                            callback(err, decoded && decoded.toString(), headers);
                        }
                    });
                } else if (encoding == 'deflate') {
                    zlib.inflate(buffer, function (err, decoded) {

                        var charset = getPageCharset(decoded.toString(), headers);

                        if (charset != false) {
                            var str = iconv.decode(decoded, charset);
                            callback(err, str && str.toString(), headers);
                        } else {
                            callback(err, decoded && decoded.toString(), headers);
                        }
                    })
                } else {

                    var charset = getPageCharset(buffer.toString(), headers);

                    if (charset != false) {

                        var str = iconv.decode(buffer.toString(), charset);
                        callback(null, str && str.toString(), headers);

                    } else {
                        
                        callback(null, buffer.toString(), headers);

                    }

                }
            });
        });
        vpnReq.on('error', function (err) {
            callback(err);
            vpnReq.end();
        });
        vpnReq.end();
    };

    var href = url.protocol + '//' + url.host;

    requestWithEncoding(getOptions(url.protocol, url.href), function (err, data, headers) {

        if (headers != undefined) {
            headers['content-encoding'] = null;
            res.set(headers);
        }
        var XMLHttpRequestOverride = '<head> \n<script type="text/javascript">\n(function() { var proxied = window.XMLHttpRequest.prototype.open;\nwindow.XMLHttpRequest.prototype.open = function() { arguments[1] = "' + resourceLoader + '" + arguments[1]  ;return proxied.apply(this, [].slice.call(arguments));};})();\n</script>'.toString();

        if (data != undefined) {

            data = data.replace("<head>", XMLHttpRequestOverride);
            data = aTagLinkAppender(data, servletPageLoader, href);
            data = replaceAllRelByAbs(data, resourceLoader, href);

            res.send(data);

        } else {
            res.send("");
        }
    });

})
;

router.get('/vpnget', checkAuth, function (req, res) {

    var url = new URL(req.query.url);

    var getOptions = function (protocol) {

        var Agent;
        if (protocol == "http:") {
            Agent = require('socks5-http-client/lib/Agent');
        } else {
            Agent = require('socks5-https-client/lib/Agent');
        }
        return {
            url: url,
            agentClass: Agent,
            timeout: 10000,
            headers: {
                connection: 'close'
            },
            agentOptions: {
                socksHost: proxyHost,
                socksPort: proxyPort
            }
        };
    };

    var requestWithEncoding = function (options, callback) {
        var vpnReq = request.get(options);

        vpnReq.on('response', function (vpnRes) {
            var chunks = [];
            vpnRes.on('data', function (chunk) {
                chunks.push(chunk);
            });

            vpnRes.on('end', function () {
                var buffer = Buffer.concat(chunks);
                var headers = vpnRes.headers;
                var encoding = vpnRes.headers['content-encoding'];
                if (encoding == 'gzip') {
                    zlib.gunzip(buffer, function (err, decoded) {
                        callback(err, decoded && decoded.toString(), headers);
                    });
                } else if (encoding == 'deflate') {
                    zlib.inflate(buffer, function (err, decoded) {
                        callback(err, decoded && decoded.toString(), headers);
                    })
                } else {
                    callback(null, buffer.toString(), headers);
                }
            });
        });
        vpnReq.on('error', function (err) {
            callback(err);
            vpnReq.end();
        });
        vpnReq.end();
    };

    var options = getOptions(url.protocol);

    var href = url.protocol + "//" + url.href;

    try {

        if (href.toLowerCase().indexOf(".jpg") >= 0 ||
            href.toLowerCase().indexOf(".gif") >= 0 ||
            href.toLowerCase().indexOf(".png") >= 0 ||
            href.toLowerCase().indexOf(".jpeg") >= 0 ||
            href.toLowerCase().indexOf(".ico") >= 0 ||
            href.toLowerCase().indexOf(".svg") >= 0) {

            request.get(options)
                .on('error', function (err) {
                    console.log(err);
                })
                .pipe(res)

        } else {
            requestWithEncoding(options, function (err, data, headers) {

                if (headers != undefined) {
                    headers['content-encoding'] = null;
                    res.set(headers);
                }

                if (data != undefined) {

                    data = data.replace(/url\(\//g, "url(" + resourceLoader + url.protocol + "//" + url.host + "/");
                    data = aTagLinkAppender(data, servletPageLoader, href);
                    data = replaceAllRelByAbs(data, resourceLoader, href);

                    res.send(data);

                } else {
                    res.send("");
                }

            });
        }
    } catch (err) {
        console.log(err);
    }


});

//router.post('/vpnget', function (req, res){
//
//    var url = new URL(req.query.url);
//
//
//    var getOptions = function (protocol, headers ,formData) {
//
//        var Agent;
//        if (protocol == "http:") {
//            Agent = require('socks5-http-client/lib/Agent');
//        } else {
//            Agent = require('socks5-https-client/lib/Agent');
//        }
//
//        headers = headers + {"connection" : 'close'};
//
//        return {
//            url: url,
//            agentClass: Agent,
//            timeout: 10000,
//            headers: headers,
//            postData: {},
//            agentOptions: {
//                socksHost: proxyHost,
//                socksPort: proxyPort
//            }
//        };
//    };
//
//    if(headers != undefined){
//        headers['host'] = url.host;
//        headers['referer'] = url.href;
//    }
//
//    var options = getOptions(url.protocol);
//
//    request.post(options)
//        .on('error', function (err) {
//            console.log(err);
//        })
//        .pipe(res)
//});

router.get('/scenario/creating', checkAuth, function(req, res) {
    res.render('scenario/generator', {
        title: 'Programing scenario',
        proxyUrl: decodeURIComponent(req.query.proxy),
        name: 'Creating scenario',
        layout: false
    });
});

module.exports = router;