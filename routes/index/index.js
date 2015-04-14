/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
var express = require('express');
var router = express.Router();

var execute = require('../../db').execute;

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

router.post('/registration', function(req, res) {
    execute('SELECT * FROM users WHERE `email` = ? OR `login` = ?', [req.body.email, req.body.login], function(data) {
        console.log(JSON.stringify(data));
        if(data.length > 0) {
            res.send({
                status: 1,
                message: 'User already exit.'
            });
        } else {
            execute('INSERT INTO users (login, password, email) VALUES (?, ?, ?)', [req.body.login, req.body.password, req.body.email], function(data) {
                res.send({
                    status: 0,
                    message: 'Success.'
                });
            });
        }
    });
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
    res.render('index/social_networks', { title: 'Social networks'});
});

router.get('/interface', function(req, res) {
    res.render('index/interface', { title: 'Interface'});
});
module.exports = router;