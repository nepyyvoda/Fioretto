var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var response = require('../../response');

var User = require('../../controllers/user');

function checkAuth(req, res, next) {
    var token = req.cookies.sid;
    jwt.verify(token, 'secret', function(err, decoded) {
        if(err) {
            res.send(response('INTERNAL_SERVER_ERROR'));
            return;
        }
        if(!decoded) {
            res.cookie('sid', '', { httpOnly: true });
            res.send(response('AUTHORIZATION_FAILED'));
        }
    });
    next();
}
function checkPermission(req, res, next) {
    var token = req.cookies.sid;
    var result = jwt.verify(token, 'secret');
    if(result.id !== parseInt(req.params.id, 10)) {
        res.send(response('PERMISSION_DENIED'));
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

router.put('/user/:id', checkAuth, checkPermission, function(req, res) {
    User.update(req, res);
});


module.exports = router;