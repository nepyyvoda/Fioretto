/**
 * Created by vitaliy on 27.05.15.
 */
var express = require('express');
var router = express.Router();
var config = require('../../config');

var querystring = require('querystring');
var colors = require('colors');
var ipn = require('paypal-ipn');


colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

router.get('/', function(req, res){
    res.end('My Edited Response will be available on console, nothing to look here!');
});

router.post('/', function(req, res){
    console.log('Received POST /'.bold);
    console.log(req.body);
    console.log('\n\n');

    // STEP 1: read POST data
    req.body = req.body || {};
    res.send(200, 'OK');
    res.end

    // var postreq = 'cmd=_notify-validate';
    var message = '';
    for (var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            var value = querystring.escape(req.body[key]);
            // postreq = postreq + "&" + key + "=" + value;
            if(message.lenght===0) {
                message = key + "=" + value;
                console.log('\n 1');
            } else {
                message = message + "&" + key + "=" + value;
            }
        }
    }

    // Step 2: POST IPN data back to PayPal to validate
    console.log('Posting back to paypal'.bold);
    console.log(message);
    console.log('\n\n');

    var params = querystring.parse(message);
    console.log('Last params');
    console.log('\n\n');
    console.log(params);
    ipn.verify(params, function callback(err, msg) {
        //Test for error
        // test.ok(err, msg);
        console.log('Response from Paypal: %s', msg);
        if (err) {
            console.error(msg);
        } else {
            //Do stuff with original params here
            if (params.payment_status == 'Completed') {
                //Payment has been confirmed as completed
                console.log('Success');

                // assign posted variables to local variables
                var item_name = req.body['item_name'];
                var item_number = req.body['item_number'];
                var payment_status = req.body['payment_status'];
                var payment_amount = req.body['mc_gross'];
                var payment_currency = req.body['mc_currency'];
                var txn_id = req.body['txn_id'];
                var receiver_email = req.body['receiver_email'];
                var payer_email = req.body['payer_email'];
                console.log('Payer EmailId = ' + payer_email);
            }
        }
    });
});