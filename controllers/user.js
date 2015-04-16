/**
 * Created by anton.nepyyvoda on 15.04.2015.
 */
var UserModel = require('../models/user');
var jwt = require('jsonwebtoken');

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
        if(err) {
            //return response
            return;
        }
        console.log(data);
    });
}

function logout(req, res) {
    res.cookie('sid', '', { httpOnly: true });
    res.send({
        status: 0,
        message: 'Logged out'
    })
}

module.exports.login = login;
module.exports.register = register;
module.exports.logout = logout;