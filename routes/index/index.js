/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
var express = require('express');
var router = express.Router();
var config = require('../../config');

var url = require('url');
var replaceAllRelByAbs = require('../../utils').replaceAllRelByAbs;
var request = require('request');
var User = require('../../controllers/user');

var jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
    var token = req.cookies.sid;
    jwt.verify(token, 'secret', function(err, decoded) {
        if(err || !decoded) {
            res.cookie('sid', '', { httpOnly: true });
            res.redirect('/login');
            return;
        }
        next();
    });
}

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index/index', { title: 'Fioretto', layout: false, name: req.path});
});

router.get('/profile', checkAuth, function(req, res) {
    res.render('index/profile', { title: 'Profile', name: req.path});
});

router.get('/pay_methods', checkAuth, function(req, res) {
    res.render('index/pay_methods', { title: 'Pay methods', name: req.path});
});

router.get('/registration', function(req, res) {
    res.render('index/registration', { title: 'Registration', layout: false, name: req.path});
});

router.get('/login', function(req, res) {
    res.render('index/login', { title: 'Login form', layout: false, name: req.path});
});

router.get('/password_recovery', function(req, res) {
    res.render('index/password_recovery', { title: 'Password recovery', layout: false, name: req.path});
});

router.get('/new_pass', function(req, res) {
    res.render('index/new_pass', { title: 'New password', layout: false, name: req.path});
});

router.get('/social_networks', function(req, res) {
    res.render('index/social_networks', { title: 'Social networks', layout: false, name: req.path});
});

router.get('/interface', function(req, res) {
    res.render('index/interface', { title: 'Interface', name: req.path});
});

router.get('/client_payment', checkAuth, function(req, res) {
    res.render('index/client_payment', { title: 'Client Payment', name: req.path});
});

router.get('/registration/:hash', function(req, res) {
    User.registerConfirm(req, res);
});

router.get('/logout', checkAuth, function(req, res) {
    User.logout(req, res);
});

router.get('/proxy/:host', function(req, res) {
    var http = require('http');
    var google = http.createClient(3128, 'your.proxy.host');
    var request = google.request('GET', '/',
        {'host': 'www.google.com'});
    request.end();
});

router.get('/scenaries', checkAuth, function(req, res) {
    res.render('index/scenaries', { title: 'Scenaries', name: req.path});
});

router.get('/sms_center', checkAuth, function(req, res) {
    res.render('index/sms_center', { title: 'sms_center', name: req.path});
});

router.post('/vpn',function(req, res) {

    var http = require('http');
    var https = require('https');
    var request = require('request');
    var URL = require('url-parse');
    var zlib = require('zlib');


    var getOptions = function(protocol, host){

        var url = protocol + "//" + host;
        var proxyHost = "127.0.0.1";
        var proxyPort = 9050;
        var Agent;

        if (protocol == "http:") {
            Agent = require('socks5-http-client/lib/Agent');
        } else {
            Agent = require('socks5-https-client/lib/Agent');
        };
        var headers = {
            "accept-charset" : "utf-8;q=0.7,*;q=0.3",
            "accept-language" : "en-US,en;q=0.8",
            "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
            "accept-encoding" : "gzip,deflate",
        };

        var options = {
            url: url,
            agentClass: Agent,
            headers: headers,
            agentOptions: {
                socksPort: 9050 
            }
        };
        return options;
    }

    var requestWithEncoding = function(options, callback) {
        var vpnReq = request.get(options);

        vpnReq.on('response', function(vpnRes) {
            var chunks = [];
            vpnRes.on('data', function(chunk) {
                chunks.push(chunk);
            });

            vpnRes.on('end', function() {
                var buffer = Buffer.concat(chunks);
                var headers = vpnRes.headers;
                var encoding = vpnRes.headers['content-encoding'];
                if (encoding == 'gzip') {
                    zlib.gunzip(buffer, function(err, decoded) {
                        callback(err, decoded && decoded.toString(),headers);
                    });
                } else if (encoding == 'deflate') {
                    zlib.inflate(buffer, function(err, decoded) {
                        callback(err, decoded && decoded.toString(),headers);
                    })
                } else {
                    callback(null, buffer.toString(),headers);
                }
            });
        });
        vpnReq.on('error', function(err) {
            callback(err);
        });
    }   
    var url = new URL(req.body.url);
    console.log()
    requestWithEncoding(getOptions(url.protocol, url.host), function(err, data, headers) {
        res.end(replaceAllRelByAbs(data,url.href));
    })
});

module.exports = router;