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

function login(req, res) {
    UserModel.login(req.body.login, req.body.password, function(err, data) {
        if(err) {
            res.send(response('AUTHORIZATION_FAILED', data));
            return;
        }
        var profile = {
            login: data[0].login,
            password: data[0].password,
            email: data[0].email,
            id: data[0].id
        };
        var token = jwt.sign(profile, 'secret', { expiresInMinutes: 60*5 });
        res.cookie('sid', token, { httpOnly: true });
        res.send(response('SUCCESS', {
            id: data[0].id
        }));
    });
}

function register(req, res) {
    UserModel.register(req.body.login, req.body.email, req.body.password, function(err, data) {
        if(err) {
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
        }, function(error, info) {
            if(error) {
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
    memoryStorage.get(req.params.hash, function(err, reply) {
        if(!err){
            if(reply) {
                var email = reply.toString();
                if(email) {
                    UserModel.activateUser(email, function(err, data) {
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
    res.cookie('sid', '', {httpOnly: true });
    res.cookie('userId', '');
    res.redirect('/login');
}

function get(req, res) {
    UserModel.get(req.params.id, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data[0]));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function update (req,res){
    UserModel.getPassword(req.cookies.userId, function(err, data) {

         if ((req.body.password === data[0].password) && (req.body.password != req.body.password_new)) {
            var UpdateDate =
            {
                email: req.body.email,
                password: req.body.password_new,
                phone: req.body.phone,
                skype: req.body.skype
            };
                UserModel.update(req.cookies.userId, UpdateDate, function (req, res) {
            });
             console.log('The profile data are updated');
        }
        else{
             console.log('The current password uncorrected or new password and current passwords are same');
         }
    });
};

module.exports.login = login;
module.exports.register = register;
module.exports.logout = logout;
module.exports.registerConfirm = registerConfirm;
module.exports.get = get;
module.exports.update = update;