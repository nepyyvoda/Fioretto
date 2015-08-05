/**
 * Created by anton.nepyyvoda on 15.04.2015.
 */
var UserModel = require('../models/user');
var jwt = require('jsonwebtoken');
var response = require('../response');
var memoryStorage = require('../memory_storage');
var mailer = require('../mailer');
var uuid = require('uuid');
var config = require('../config');
var log = require('../logger')(module);
var sha256 = require('sha256');

function login(req, res) {
    UserModel.login(req.body.login, req.body.password, function (err, data) {
        if (err) {
            res.send(response('AUTHORIZATION_FAILED', data));
            return;
        }
        var profile = {
            login: data[0].login,
            password: data[0].password,
            email: data[0].email,
            id: data[0].id
        };
        var token = jwt.sign(profile, 'secret', {expiresInMinutes: 60 * 5});
        res.cookie('sid', token, {httpOnly: true});
        res.send(response('SUCCESS', {
            id: data[0].id
        }));
    });
}

function register(req, res) {
    UserModel.register(req.body.login, req.body.email, req.body.password, function (err, data) {
        if (err) {
            res.send(response('INTERNAL_SERVER_ERROR'));
            return;
        }
        var uid = uuid.v4();
        console.log(uid);
        memoryStorage.set(uid, req.body.email);
        console.log('<a href="' + config.get('host') + '/register/' + uid + '">Confirm your registration at Fiaretto</a>, or just ignore this mail.');
        mailer.send({
            to: [req.body.email],
            subject: 'Registration in Fioretto',
            html: '<a href="' + config.get('host') + '/registration/' + uid + '">Confirm your registration at Fiaretto</a>, or just ignore this mail.'//text:
        }, function (error, info) {
            if (error) {
                res.send(response('INTERNAL_SERVER_ERROR'));
            } else {
                res.send(response('SUCCESS', {
                    message: 'Completed registration first step'
                }));
            }
        });
    });
}

function registerConfirm(req, res) {
    memoryStorage.get(req.params.hash, function (err, reply) {
        if (!err) {
            if (reply) {
                var email = reply.toString();
                if (email) {
                    UserModel.activateUser(email, function (err, data) {
                        if (err) {
                            res.render('index/registration_success', {
                                title: 'Registration confirm',
                                status: 1,
                                layout: false
                            });
                            return;
                        }
                        res.render('index/registration_success', {
                            title: 'Registration confirm',
                            status: 0,
                            email: email,
                            layout: false
                        });
                    });
                }
            } else {
                res.render('index/registration_success', {title: 'Registration confirm', status: 1, layout: false});
            }
        } else {
            res.render('index/registration_success', {title: 'Registration confirm', status: 1, layout: false});
        }
    });
}

function logout(req, res) {
    res.cookie('sid', '', {httpOnly: true});
    res.cookie('userId', '');
    res.redirect('/login');
}

function passwordRecovery(req, res) {

    UserModel.checkUserExists(req.body.email, function (err, data) {

        if (err) {
            res.status(0).json({ message: 'User with this email not found'}).end();
            return;
        } else {

            var uid = uuid.v4();
            console.log(uid);
            memoryStorage.set(uid, req.body.email);
            mailer.send({
                to: [req.body.email],
                subject: 'Fiaretto password recovery',
                html: 'Follow this <a href="' + config.get('host') + '/new_pass/' + uid + '"> link </a>, to change your password on Fiaretto.'
            }, function (error, info) {
                if (error) {
                    res.status(500).json({message: 'Internal error, try again later'}).end()

                } else {
                    res.status(0).json({message: 'Check mail for a message'}).end();

                }
            });
        }
    })
}

function newPassword(req, res) {

    if(req.body.newPassword.length === 0 || req.body.confirmPassword.length === 0){
        res.status(0).json({code: 1, message: 'Passwords can not be empty'})
        return;
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        res.status(0).json({code: 1, message: 'Passwords does not match'});
        return;
    }
    memoryStorage.get(req.body.hash, function (err, reply) {

        if (!err) {
            if (reply) {
                var email = reply.toString();
                if (email) {

                    var newPass = sha256(req.body.newPassword);
                    UserModel.updatePassword(email, newPass, function(err, data){
                        if(err){
                        } else {
                            res.status(0).json({code: 0,message: 'Success'});
                            memoryStorage.del(req.body.hash);
                        }
                    })
                }
            } else {
                res.status(0).json({code: 1,message: 'This link is unsupported now'});
            }
        } else {
            res.status(0).json({code: 1,message: 'Internal error'});
        }
    });

}

function get(req, res) {
    console.log('CHECK', req.params.id);
    UserModel.get({id: req.params.id}, function (err, data) {
        if (!err) {
            res.send(response('SUCCESS', data[0]));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function update(req, res) {

    UserModel.getPassword(req.cookies.userId, function (err, data) {

        if ((req.body.password === data[0].password)) {
            if (req.body.password != req.body.password_new) {
                if ((req.body.password_new === req.body.confirm_password_new)) {

                    var updateData = {
                        id: req.cookies.userId,
                        data: {
                            password: req.body.password_new
                        }
                    };

                    UserModel.update(updateData, function (error, data) {
                        if (error) {
                            res.status(500);
                        }
                    });
                    res.status(0).json({message: 'Updated'})
                } else {
                    res.status(0).json({message: 'The new passwords does not match'})
                }
            } else {
                res.status(0).json({message: 'New password matches the old one'})
            }
        } else {
            res.status(0).json({message: 'Wrong old password'})
        }
    });
}

module.exports.login = login;
module.exports.register = register;
module.exports.logout = logout;
module.exports.registerConfirm = registerConfirm;
module.exports.newPassword = newPassword;
module.exports.passwordRecovery = passwordRecovery;
module.exports.get = get;
module.exports.update = update;