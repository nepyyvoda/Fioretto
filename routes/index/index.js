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

var timeoutTime = config.get('vpn:timeout');

var userAvailablePages = [
    '/profile',
    '/pay_methods',
    '/social_networks',
    '/interface',
    '/client_payment',
    '/logout',
    '/subscription',
    '/pay/ipn',
    '/scenaries',
    '/vpn/',
    '/scenario-manager/',
    '/scenario/creating'
];
var adminAvailablePages = [
    '/profile',
    '/pay_methods',
    '/social_networks',
    '/interface',
    '/client_payment',
    '/logout',
    '/subscription',
    '/pay/ipn',
    '/scenaries',
    '/vpn/',
    '/scenario-manager/',
    '/scenario/creating',
    '/admin/payments'
];

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

function checkPermission(req, res, next) {
    var token = req.cookies.sid;
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err || !decoded) {
            res.cookie('sid', '', {httpOnly: true});
            res.redirect('/login');
        } else {
            req.role = decoded.role;
            var availablePages;
            if (decoded.role === 1) {
                availablePages = adminAvailablePages;

            } else {
                availablePages = userAvailablePages;
            }
            if (availablePages.indexOf(req.path) < 0) {
                res.cookie('sid', '', {httpOnly: true});
                res.render('404', {title: 'Not Found', layout: false});
            } else {
                next()
            }
        }
    });
}
function checkAvailableServiceBrowser(req, res, next) {
    //crutch!!!
    var reqst = {
        params: {
            id: req.cookies.userId,
            servicesid: 1
        }
    };

    Services.availableBrowser(reqst, {
        send: function (obj) {

            if (obj.data.available === 1)
                next();
            else {
                res.redirect('/subscription');
                return;
            }
        }
    });
}

/* GET home page. */
router.get('/', function (req, res) {
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/index', {title: 'Fioretto', layout: false, name: req.path, role: req.role});
        }
    });
});
router.get('/profile', checkAuth, checkPermission, function (req, res) {
    if(req.role === 1){
        //TODO:render page
        res.render('index/adminPage', {title: 'Profile', name: req.path, role: req.role});
    }
    res.render('index/profile', {title: 'Profile', name: req.path, role: req.role});
});
router.get('/pay_methods', checkAuth, checkPermission, function (req, res) {
    res.render('index/pay_methods', {title: 'Pay methods', name: req.path, role: req.role});
});

router.get('/registration', function (req, res) {
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/registration', {title: 'Registration', layout: false, name: req.path, role:req.role});
        }
    });
});
router.get('/login', function (req, res) {
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/login', {title: 'Login form', layout: false, name: req.path, role:req.role});
        }
    });
});
router.get('/password_recovery', function (req, res) {
    isLogged(req.cookies.sid, function (state) {
        if (state === true) {
            res.redirect('/profile');
        } else {
            res.render('index/password_recovery', {title: 'Password recovery', layout: false, name: req.path, role:req.role});
        }
    });
});
router.get('/new_pass/:hash', function (req, res) {
    res.cookie('hash', req.params.hash);
    res.render('index/new_pass', {title: 'New password', layout: false, name: req.path, role:req.role});
    res.end();
});
router.get('/social_networks', function (req, res) {
    res.render('index/social_networks', {title: 'Social networks', layout: false, name: req.path, role:req.role});
});
router.get('/interface', checkAuth, checkPermission, function (req, res) {
    res.render('index/interface', {title: 'Interface', name: req.path, role:req.role});
});
router.get('/client_payment', checkAuth, checkPermission, function (req, res) {
    res.render('index/client_payment', {title: 'Client Payment', name: req.path, role: req.role});
});
router.get('/registration/:hash', function (req, res) {
    User.registerConfirm(req, res);
});
router.get('/logout', checkAuth, checkPermission, function (req, res) {
    User.logout(req, res);
});
router.get('/subscription', checkAuth, checkPermission, function (req, res) {
    res.render('index/subscription', {title: 'Subscription', name: req.path, role: req.role});
});
router.post('/pay/ipn', function (req, res) {
    Paypal.ipn_processor(req, res);
});
router.get('/scenaries', checkAuth, checkPermission, function (req, res) {
    res.render('index/scenaries', {title: 'Scenaries', name: req.path, role: req.role});
});

router.use(checkAuth, timeout(timeoutTime), new ProxyBrowsing({
    prefix: '/vpn/',
    requestMiddleware: [
        vpn.addProxySettings
    ]
}));

router.use(checkAuth, new Unblocker({prefix: '/scenario-manager/'}));

router.get('/scenario/creating', checkAuth, function (req, res) {
    res.render('scenario/generator', {
        title: 'Programing scenario',
        proxyUrl: decodeURIComponent(req.query.proxy),
        name: 'Creating scenario',
        layout: false,
        role: req.role
    });
});

router.get('/admin/payments', checkAuth, checkPermission, function (req, res) {
    res.render('admin/payments', {title: 'Payments', name: req.path, role: req.role});
});

//Admin routers
router.get('/admin/tariffs', checkAuth, checkPermission, function(req, res){
    res.render('admin/tariffs',{title: 'Tariffs', name: req.path, role: req.role})
});


module.exports = router;