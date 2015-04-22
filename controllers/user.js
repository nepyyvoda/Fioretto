/**
 * Created by anton.nepyyvoda on 15.04.2015.
 */
var UserModel = require('../models/user');
var jwt = require('jsonwebtoken');

var memoryStorage = require('../memory_storage');
var mailer = require('../mailer');
var uuid = require('uuid');
var config = require('../config');

function getResponse(code) {
    var codes = {
        USER_ALREADY_EXIST: {
            status: 3,
            message: 'User already exist'
        },
        USER_NOT_FOUND: {
            status: 4,
            message: 'User not found'
        }
    };
    if(code in codes) {
        return codes[code];
    }
    return {
        status: 0,
        message: 'Success'
    };
}

function login(req, res) {
    UserModel.login(req.body.login, req.body.password, function(err, data) {
        if(err) {
            res.send(getResponse(data));
            return;
        }
        var profile = {
            login: data.login,
            password: data.password,
            email: data.email,
            id: data.id
        };
        var token = jwt.sign(profile, 'secret', { expiresInMinutes: 60*5 });
        res.cookie('sid', token, { httpOnly: true });
        res.send(getResponse(data));
    });
}

function register(req, res) {
    UserModel.register(req.body.login, req.body.email, req.body.password, function(err, data) {
        console.log(err, data);
        if(err) {
            res.send(getResponse({
                status: 1,
                message: 'Completed registration first step'
            }));
            return;
        }
        var uid = uuid.v4();
        console.log(uid);
        memoryStorage.set(uid, req.body.email);
        console.log('<a href="' + config.get('host') + '/register/' + uid + '">Confirm your registration at Fioretto</a>, or just ignore this mail.');
        mailer.send({
            to: [req.body.email],
            subject: 'Registration in Fioretto',
            html: '<a href="' + config.get('host') + '/registration/' + uid + '">Confirm your registration at Fioretto</a>, or just ignore this mail.'//text:
        }, function(error, info) {
            if(error) {
                console.log('error', error);
            }
            console.log('info', info)
        });
        res.send(getResponse({
            status: 0,
            message: 'Completed registration first step'
        }));
    });
}

function registerConfirm(req, res) {
    memoryStorage.get(req.params.hash, function(err, reply) {
        if(!err){
            if(reply) {
                var email = reply.toString();
                if(email) {
                    UserModel.activateUser(email, function(err, data) {
                        console.log(err, data);
                        if(err) {
                            res.render('index/registration_success', { title: 'Registration confirm', status: 1, layout: false});
                            return;
                        }
                        res.render('index/registration_success', { title: 'Registration confirm', status: 0, email: email, layout: false});
                    });
                }
            } else {
                res.render('index/registration_success', { title: 'Registration confirm', status: 1, layout: false});
            }
        } else {
            res.render('index/registration_success', { title: 'Registration confirm', status: 1, layout: false});
        }
    });
}

function logout(req, res) {
    res.cookie('sid', '', { httpOnly: true });
    res.redirect('/login');
}

module.exports.login = login;
module.exports.register = register;
module.exports.logout = logout;
module.exports.registerConfirm = registerConfirm;