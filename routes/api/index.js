var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var response = require('../../response');
var uid = require('uid');
var request = require('request');
var User = require('../../controllers/user');
var Scenarios = require('../../controllers/scenarios');
var Payments = require('../../controllers/payments');
var Services = require('../../controllers/services');
var MasterCard = require('../../controllers/mastercard');
var Tariffs = require('../../controllers/tariffs');
var Workers = require('../../controllers/workers');

var userUnavailableRouters = [
    new RegExp("\/admin(\/)?[^]*", "gmi")
];


function checkAuth(req, res, next) {
    var token = req.cookies.sid;
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            res.send(response('INTERNAL_SERVER_ERROR'));
            return;
        }
        if (!decoded) {
            res.cookie('sid', '', {httpOnly: true});
            res.send(response('AUTHORIZATION_FAILED'));
            return;
        }
        next();
    });
}
function checkPermission(req, res, next) {
    var token = req.cookies.sid;
    var result = jwt.verify(token, 'secret');
    if (result.id !== parseInt(req.params.id, 10)) {
        res.send(response('PERMISSION_DENIED'));
        return;
    }
    next();
}

function checkUserRole(req, res, next) {

    var token = req.cookies.sid;
    var path = req.path.toString();

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err || !decoded) {
            //TODO: change 404 to 403
            res.render('404', {title: 'Not Found', layout: false});
            return;
        } else {
            var isAllowed = true;
            if (decoded.role !== 1) {
                userUnavailableRouters.forEach(function (data) {
                    if (path.match(data)) {
                        isAllowed = false;
                    }
                });
            }
            if (!isAllowed) {
                //TODO: change 404 to 403
                res.render('404', {title: 'Not Found', layout: false});
                return;
            }
        }
        next()
    });
}

router.post('/login', User.login);

router.post('/registration', User.register);

router.get('/user/:id', checkAuth, checkPermission, checkUserRole, User.get);

router.get('/scenarios', checkAuth, checkUserRole, Scenarios.getScenarios);

router.get('/scenarios/init', function (req, res) {
    var proxyId = uid(10);
    var proxyURL = '/proxy-' + proxyId;
    var url = decodeURIComponent(req.query.url);
    router.use(proxyURL, function (req, res, next) {
        req.pipe(request(url)).pipe(res);
    });
    res.send({status: 0, proxy: proxyURL});
});

router.post('/scenarios', checkAuth, checkUserRole, Scenarios.create);

//todo check permissions
router.get('/scenarios/:id', checkAuth, checkUserRole, Scenarios.getScenario);

router.post('/scenarios/:id/start', checkAuth, checkUserRole, Scenarios.startScenario);

router.put('/scenarios/:id', checkAuth, checkUserRole, Scenarios.update);

router.delete('/scenarios/:id', checkAuth, checkUserRole, Scenarios.del);

router.post('/scenarios/:id/confirmation', Scenarios.changeState);

router.put('/user/:id', checkAuth, checkPermission, checkUserRole, User.update);

router.put('/password/recovery', User.passwordRecovery);

router.put('/password/new', User.newPassword);

router.get('/user/:id/payments/', checkAuth, checkUserRole, Payments.history);

router.get('/user/:id/services/:servicesid', checkAuth, checkUserRole, Services.availableBrowser);

router.get('/user/:id/services/voting', checkAuth, checkUserRole, Services.availableVoteManager);

router.get('/services/:servicesid/price', checkAuth, checkUserRole, Services.priceServices);

router.post('/services/buy', checkAuth, checkUserRole, Services.buyService);

router.post('/payment/mastercard', checkAuth, checkUserRole, MasterCard.mc_pay_processor);

//Admin router

router.get('/admin/payments', checkAuth, checkUserRole, Payments.getAllPayments);

router.post('/admin/tariffs', checkAuth, checkUserRole, Tariffs.create);

router.get('/admin/tariffs', checkAuth, checkUserRole, Tariffs.getAll);

router.get('/admin/tariffs/:key', checkAuth, checkUserRole, Tariffs.getByKey);

router.put('/admin/tariffs', checkAuth, checkUserRole, Tariffs.update);

router.delete('/admin/tariffs/:name', checkAuth, checkUserRole, Tariffs.remove);

router.get('/worker/status', checkAuth, checkUserRole, Workers.getStatus);

module.exports = router;