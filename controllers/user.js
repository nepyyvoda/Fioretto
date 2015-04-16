/**
 * Created by anton.nepyyvoda on 15.04.2015.
 */
var UserModel = require('../models/user');
var jwt = require('jsonwebtoken');

function getResponse(code) {
    var codes = {
        USER_ALREADY_EXIST: {
            status: 1,
            message: 'User already exist'
        },
        USER_NOT_FOUND: {
            status: 2,
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
        console.log('logine', arguments);
        if(err) {
            res.send(getResponse(data));
            return;
        }
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
        //TODO validate req.body.username and req.body.password
        //if is invalid, return 401
        //if (!(req.body.username === 'john.doe' && req.body.password === 'foobar')) {
        //    res.send(401, 'Wrong user or password');
        //    return;
        //}
        //var profile = {
        //    first_name: 'John',
        //    last_name: 'Doe',
        //    email: 'john@doe.com',
        //    id: 123
        //};
        //
        //// We are sending the profile inside the token
        //var token = jwt.sign(profile, 'secret', { expiresInMinutes: 60*5 });
        //res.cookie('sid', token, { httpOnly: true });
        //res.json({ token: token });
    });
}

module.exports.login = login;
module.exports.register = register;