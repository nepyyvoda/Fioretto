/**
 * Created by vitaliy on 03.06.15.
 */

var querystring = require('querystring');
var request = require('request');
var Payment = require('../models/paypalpay');
var UsersPayments = require('../models/userspayments');
var log = require('../logger')(module);
var UserModel = require('../models/user');

function ipn_processor(req, res){

    log.info('Received POST /');
    log.info(req.body);
    log.info('\n\n');
    var data_body = req.body;
    var user_data_from_ipn = JSON.parse(data_body['custom']);
    log.info('user = ', user_data_from_ipn);
    // STEP 1: read POST data
    req.body = req.body || {};
    res.status(200).send('OK');

    Payment.create(user_data_from_ipn.userId, data_body['mc_gross'],new Date(data_body['payment_date']).getTime(),data_body['ipn_track_id'], data_body['txn_id'], function(status, id){
        // read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'
        if(!status){
            UsersPayments.create(user_data_from_ipn.userId,
                data_body['payer_id'],
                data_body['receiver_id'],
                0,
                0,
                new Date(data_body['payment_date']),
                0,
                0,
                0,
                'start',
                data_body['txn_id'],
                0,
                data_body['mc_gross'],
                0,
                0,
                0x0,function(status, userpaymentid){

                    var postreq = 'cmd=_notify-validate';
                    log.info("ID = ", id);
                    for (var key in req.body) {
                        if (req.body.hasOwnProperty(key)) {
                            var value = querystring.escape(req.body[key]);
                            postreq = postreq + "&" + key + "=" + value;
                        }
                    }

                    // Step 2: POST IPN data back to PayPal to validate
                    log.info('Posting back to paypal');
                    log.info(postreq);
                    log.info('\n\n');
                    var options = {
                        url: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
                        method: 'POST',
                        headers: {
                            'Connection': 'close'
                        },
                        body: postreq,
                        strictSSL: true,
                        rejectUnauthorized: false,
                        requestCert: true,
                        agent: false
                    };

                    request(options, function callback(error, response, body) {
                        if (!error && response.statusCode === 200) {

                            // inspect IPN validation result and act accordingly

                            if (body.substring(0, 8) === 'VERIFIED'){
                                // The IPN is verified, process it
                                log.info('Verified IPN!');
                                log.info('\n\n');

                                // assign posted variables to local variables
                                var item_name = req.body['item_name'];
                                var item_number = req.body['item_number'];
                                var payment_status = req.body['payment_status'];
                                var payment_amount = +req.body['mc_gross'] * 100;
                                var payment_currency = req.body['mc_currency'];
                                var txn_id = req.body['txn_id'];
                                var receiver_email = req.body['receiver_email'];
                                var payer_email = req.body['payer_email'];

                                //Lets check a variable
                                log.info("Checking variable");
                                log.info("payment_status:", payment_status)
                                log.info('\n\n');

                                // IPN message values depend upon the type of notification sent.
                                // To loop through the &_POST array and print the NV pairs to the screen:
                                log.info('Printing all key-value pairs...')
                                for (var key in req.body) {
                                    if (req.body.hasOwnProperty(key)) {
                                        var value = req.body[key];
                                        log.info(key + "=" + value);
                                    }
                                }

                                Payment.update(id, {status:"complete"}, function(status, data){
                                    if (!status) {
                                        log.info('Success Complete Paypal pay update', data);
                                        UserModel.get({id : +user_data_from_ipn.userId}, function(statusErr, data){
                                            if(!statusErr){
                                                //parse to cents
                                                var newBalance = +data[0].balance + payment_amount;
                                                UserModel.update({id : +user_data_from_ipn.userId, data : {balance: newBalance}}, function(statusErr, data){
                                                    if(!statusErr){
                                                        log.info("USER UPDATE SUCCESS! ", data);
                                                        UsersPayments.update(userpaymentid, {end_time: new Date(), textStatus: 'complete', amount: payment_amount}, function(status, data){
                                                            if(!status){
                                                                log.info("USERPAYMENTS UPDATE SUCCESS! ", data);
                                                            } else {
                                                                log.warn("USERPAYMENTS NOT UPDATE SUCCESS! ", data);
                                                            }
                                                        });
                                                    }else{
                                                        log.warn("USER NOT UPDATE SUCCESS! ", data);
                                                    }
                                                });
                                            }
                                        });

                                    }else
                                        log.info(data);
                                });

                            } else if (body.substring(0, 7) === 'INVALID') {
                                // IPN invalid, log for manual investigation
                                log.info('Invalid IPN!');
                                log.info('\n\n');
                                Payment.update(id, {status:"error"}, function(status, data){
                                    if (status)
                                        log.info(data);
                                });
                            }

                        }
                    });
                });
        }
    });
}

module.exports.ipn_processor = ipn_processor;