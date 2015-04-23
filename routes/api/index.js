var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var User = require('../../controllers/user');

function checkAuth(req, res, next) {
    var token = req.cookies.sid;
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
        }
    });
    next();
}
function checkPermission(req, res, next) {
    var token = req.cookies.sid;
    var result = jwt.verify(token, 'secret');
    if(result.id !== parseInt(req.params.id, 10)) {
        res.send({
            status: 5,
            message: 'Permission denied'
        });
        return;
    }
    next();
}
router.post('/login', function (req, res) {
    User.login(req, res);
});
router.post('/registration', function(req, res) {
    User.register(req, res);
});
router.get('/user/:id', checkAuth, checkPermission, function(req, res) {
    User.get(req, res);
});

module.exports = router;