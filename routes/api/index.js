var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var User = require('../../controllers/user');

function checkAuth(req, res, next) {
    var token = req.cookies.sid;
    console.log('checkAuth', token);
    jwt.verify(token, 'secret', function(err, decoded) {
        if(err) {
            res.send({
                status: 1,
                message: 'Internal server error'
            });
            return;
        }
        if(!decoded) {
            res.send({
                status: 2,
                message: 'Authorization failed'
            });
            return;
        }
        next();
    });
}

router.post('/logout', checkAuth, function(req, res) {
    User.logout(req, res);
});
router.post('/login', function (req, res) {
    User.login(req, res);
});
router.post('/registration', function(req, res) {
    User.register(req, res);
});

module.exports = router;