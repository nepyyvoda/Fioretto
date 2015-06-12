var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var response = require('../../response');

var User = require('../../controllers/user');
var Scenarios = require('../../controllers/scenarios');

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
            return;
        }
        next();
    });
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

router.get('/scenarios', checkAuth, function(req, res) {
    //get user scenarios
    Scenarios.getScenarios(req, res);
});
//todo check permissions
router.get('/scenarios/:id', checkAuth, function(req, res) {
    //get user scenario by id
    Scenarios.getScenario(req, res);
});

router.post('/scenarios', checkAuth, function(req, res) {
    //create scenario
});

router.put('/scenarios/:id', checkAuth, function(req, res) {
    //update scenario
});

router.delete('/scenarios/:id', checkAuth, function(req, res) {
    Scenarios.del(req, res);
});

router.put('/users/:id', checkAuth, checkPermission, function(req, res) {
       User.update(req, res);
});

module.exports = router;