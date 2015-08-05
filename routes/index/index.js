/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
var express = require('express');
var router = express.Router();
var config = require('../../config');
var Paypal = require('../../controllers/paypal');
var User = require('../../controllers/user');
var jwt = require('jsonwebtoken');
var vpn = require('../../browsing/vpn');
var Services = require('../../controllers/services');
var Unblocker = require('unblocker');
var ProxyBrowsing = require('../../browsing/lib/unblocker');
var timeout = require('connect-timeout');

var  timeoutTime = config.get('vpn:timeout');

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

function checkAvailableServiceBrowser(req, res, next){
    //crutch!!!
    var reqst = {
        params : {
            id : req.cookies.userId,
            servicesid : 1
        }
    };

    Services.availableBrowser(reqst, {send : function(obj){

        if(obj.data.available === 1)
            next();
        else {
            res.redirect('/subscription');
            return;
        }
    }});
}

/* GET home page. */
router.get('/', function (req, res) {
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
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
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/registration', {title: 'Registration', layout: false, name: req.path});
        }
    });
});
router.get('/login', function (req, res) {
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/login', {title: 'Login form', layout: false, name: req.path});
        }
    });
});
router.get('/password_recovery', function (req, res) {
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/password_recovery', {title: 'Password recovery', layout: false, name: req.path});
        }
    });
});
router.get('/new_pass/:hash', function (req, res) {
    res.cookie( 'hash', req.params.hash);
    res.render('index/new_pass', {title: 'New password', layout: false, name: req.path});
    res.end();
});
router.get('/social_networks', function (req, res) {
    res.render('index/social_networks', {title: 'Social networks', layout: false, name: req.path});
});
router.get('/interface',checkAuth , function (req, res) {
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
router.get('/subscription', checkAuth, function (req, res) {
    res.render('index/subscription', {title: 'Subscription', name: req.path});
});
router.post('/pay/ipn', function (req, res) {
    Paypal.ipn_processor(req, res);
});
router.get('/scenaries', checkAuth, function (req, res) {
    res.render('index/scenaries', {title: 'Scenaries', name: req.path});
});

router.use(checkAuth, timeout(timeoutTime), new ProxyBrowsing({prefix: '/vpn/',
    requestMiddleware: [
        vpn.addProxySettings
    ]}));

router.use(checkAuth, new Unblocker({prefix: '/scenario-manager/'}));

router.get('/scenario/creating', checkAuth, function (req, res) {
    res.render('scenario/generator', {
        title: 'Programing scenario',
        proxyUrl: decodeURIComponent(req.query.proxy),
        name: 'Creating scenario',
        layout: false
    });
});

module.exports = router;