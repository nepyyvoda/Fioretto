/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index/index', { title: 'Fioretto', layout: false});
});

router.get('/profile', function(req, res) {
    res.render('index/profile', { title: 'Profile'});
});

router.get('/pay_methods', function(req, res) {
    res.render('index/pay_methods', { title: 'Pay methods'});
});

router.get('/registration', function(req, res) {
    res.render('index/registration', { title: 'Registration', layout: false});
});

router.get('/login', function(req, res) {
    res.render('index/login', { title: 'Login form', layout: false});
});

router.get('/password_recovery', function(req, res) {
    res.render('index/password_recovery', { title: 'Password recovery', layout: false});
});

router.get('/new_pass', function(req, res) {
    res.render('index/new_pass', { title: 'New password', layout: false});
});

router.get('/social_networks', function(req, res) {
    res.render('index/social_networks', { title: 'Social networks', layout: false});
});

router.get('/interface', function(req, res) {
    res.render('index/interface', { title: 'interface'});
});

router.get('/client_payment', function(req, res) {
    res.render('index/client_payment', { title: 'client_payment'});
});
module.exports = router;