/*
 * Created by vitaliy on 29.05.15.
 */

var express = require('express');
var router = express.Router();
var Paypal = require('../../controllers/paypal');
var log = require('../../logger')(module);

/*
 *    user:   {type: String},
 txn_id:    {type: String},
 proc_id:    {type: String},
 amount: {type: Number},
 date: {type: Date},
 ipn_track_id: {type: String},
 status: {type: String}
 */

router.get('/', function(req, res){
    log.info("GET /pay");
    res.render('index/pay', { title: 'Paypal', name: req.path});
    log.info("render /pay");
});

router.post('/ipn', function(req, res){
    log.info("Enter to controller");
    Paypal.ipn_processor(req, res);
});

module.exports = router;