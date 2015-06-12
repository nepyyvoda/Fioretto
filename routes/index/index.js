/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
 var express = require('express');
 var router = express.Router();
 var config = require('../../config');
 var Paypal = require('../../controllers/paypal');
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
router.get('/interface', checkAuth, function(req, res) {
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
router.get('/pay', checkAuth, function(req, res){
    res.render('index/pay', { title: 'Paypal', name: req.path});
});
router.post('/pay/ipn', function(req, res){
    Paypal.ipn_processor(req, res);
});
router.get('/scenaries', function(req, res) {
    res.render('index/scenaries', { title: 'Scenaries', name: req.path});
});

var http = require('http');
var https = require('https');
var request = require('request');
var URL = require('url-parse');
var zlib = require('zlib');
var random_ua = require('random-ua');
var  replaceAllRelByAbs = require('../../utils/').replaceAllRelByAbs;
var  aTagLinkAppender = require('../../utils/aTagLinkAppender.js').aTagLinkAppender;

const proxyHost = "127.0.0.1";
const proxyPort = 9050;

router.get('/vpn',function(req, res) {

    var getOptions = function(protocol, url){

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
            "user-agent" : random_ua.generate(),
            "accept-encoding" : "gzip,deflate",
        };

        var options = {
            url: url,
            agentClass: Agent,
            headers: headers,
            agentOptions: {
                socksHost: proxyHost,
                socksPort: proxyPort
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
    var url = new URL(req.query.url);
    var href = url.protocol + '//' + url.host;

    requestWithEncoding(getOptions(url.protocol, url.href), function(err, data, headers) {
        if (headers != undefined) {
            headers['content-encoding'] = null;    
            res.set(headers);
        };

        data = aTagLinkAppender(data, "/vpn?url=" , href)
        data = replaceAllRelByAbs(data, "/vpnget?url=" , href);

        res.end(data);
    })
});

router.get('/vpnget',function(req, res){

    var url = new URL(req.query.url);

    var getOptions = function(protocol, host, headers){

        var href = protocol + "//" + host;
        var Agent;

        if (protocol == "http:") {
            Agent = require('socks5-http-client/lib/Agent');
        } else {
            Agent = require('socks5-https-client/lib/Agent');
        };

        var options = {
            url: url,
            agentClass: Agent,
            agentOptions: {
                socksHost: proxyHost,
                socksPort: proxyPort
            }
        };
        return options;
    }

    var tmp = request.get(getOptions(url.protocol, url.host, req.headers));

    tmp.pipe(res);

    // request.get(url.href).pipe(res);

});

module.exports = router;