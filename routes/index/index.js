/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
var express = require('express');
var router = express.Router();
var config = require('../../config');

var User = require('../../controllers/user');

var jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
    var token = req.cookies.sid;
    jwt.verify(token, 'secret', function(err, decoded) {
        if(err || !decoded) {
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

module.exports = router;