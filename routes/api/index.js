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

var userAvailablePages = [
    new RegExp("\/user\/[^/]*", "gmi"),
    new RegExp("\/scenarios\/[^/]*", "gmi"),
    new RegExp("\/services\/[^/]*", "gmi"),
    new RegExp("\/payment\/[^/]*", "gmi")
];
var adminAvailablePages = [
    new RegExp("\/user\/[^/]*", "gmi"),
    new RegExp("\/scenarios\/[^/]*", "gmi"),
    new RegExp("\/services\/[^/]*", "gmi"),
    new RegExp("\/payment\/[^/]*", "gmi")
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
            res.cookie('sid', '', {httpOnly: true});
            res.sendStatus(403)
        } else {
            var availablePages;
            var isAllowed = false;
            if (decoded.role === 2) {
                availablePages = adminAvailablePages;
            } else {
                availablePages = userAvailablePages;
            }
            availablePages.forEach(function (data) {
                if (path.match(data)) {
                    isAllowed = true;
                }
            });
            if (!isAllowed) {
                res.sendStatus(403);
                return;
            }
        }
        next()
    });
}

router.post('/login', function (req, res) {
    User.login(req, res);
});

router.post('/registration', function (req, res) {
    User.register(req, res);
});

router.get('/user/:id', checkAuth, checkPermission, checkUserRole, function (req, res) {
    User.get(req, res);
});

router.get('/scenarios', checkAuth, checkUserRole, function (req, res) {
    //get user scenarios
    Scenarios.getScenarios(req, res);
});

router.get('/scenarios/init', function (req, res) {
    var proxyId = uid(10);
    var proxyURL = '/proxy-' + proxyId;
    var url = decodeURIComponent(req.query.url);
    router.use(proxyURL, function (req, res, next) {
        req.pipe(request(url)).pipe(res);
    });
    res.send({status: 0, proxy: proxyURL});
});

router.post('/scenarios', checkAuth, checkUserRole, function (req, res) {
    Scenarios.create(req, res);
});

//todo check permissions
router.get('/scenarios/:id', checkAuth, checkUserRole, function (req, res) {
    Scenarios.getScenario(req, res);
});

router.post('/scenarios/:id/start', checkAuth, checkUserRole, function (req, res) {
    Scenarios.startScenario(req, res);
});

router.put('/scenarios/:id', checkAuth, checkUserRole, function (req, res) {
    Scenarios.update(req, res);
});

router.delete('/scenarios/:id', checkAuth, checkUserRole, function (req, res) {
    Scenarios.del(req, res);
});

router.post('/scenarios/:id/confirmation', function (req, res) {
    Scenarios.changeState(req, res);
});

router.put('/user/:id', checkAuth, checkPermission, checkUserRole, function (req, res) {
    User.update(req, res);
});

router.put('/password/recovery', function (req, res) {
    User.passwordRecovery(req, res);
});

router.put('/password/new', function (req, res) {
    User.newPassword(req, res);
});

router.get('/user/:id/payments/', checkAuth, checkUserRole, function (req, res) {
    Payments.history(req, res);
});

router.get('/user/:id/services/:servicesid', checkAuth, checkUserRole, function (req, res) {
    Services.availableBrowser(req, res);
});

router.get('/user/:id/services/voting', checkAuth, checkUserRole, function (req, res) {
    Services.availableVoteManager(req, res);
});

router.get('/services/:servicesid/price', checkAuth, checkUserRole, function (req, res) {
    Services.priceServices(req, res);
});

router.post('/services/buy', checkAuth, checkUserRole, function (req, res) {
    Services.buyService(req, res);
});

router.post('/payment/mastercard', checkAuth, checkUserRole, function (req, res) {
    MasterCard.mc_pay_processor(req, res);
});

module.exports = router;