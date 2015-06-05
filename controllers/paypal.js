/**
 * Created by vitaliy on 03.06.15.
 */

var querystring = require('querystring');
var request = require('request');
var Payment = require('../models/paypalpay');
var log = require('../logger')(module);

function ipn_processor(req, res){

    log.infi('Received POST /');
    log.infi(req.body);
    log.infi('\n\n');
    var data_body = req.body;
    var user_data_from_ipn = JSON.parse(data_body['transaction_subject']);

    // STEP 1: read POST data
    req.body = req.body || {};
    res.status(200).send('OK');

    Payment.create(user_data_from_ipn.user, data_body['mc_gross'],new Date(data_body['payment_date']).getTime(),data_body['ipn_track_id'], data_body['txn_id'], function(status, id){
        // read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'
        var postreq = 'cmd=_notify-validate';
        log.infi("ID = ", id);
        for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                var value = querystring.escape(req.body[key]);
                postreq = postreq + "&" + key + "=" + value;
            }
        }

        // Step 2: POST IPN data back to PayPal to validate
        log.infi('Posting back to paypal');
        log.infi(postreq);
        log.infi('\n\n');
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
                    log.infi('Verified IPN!');
                    log.infi('\n\n');

                    // assign posted variables to local variables
                    var item_name = req.body['item_name'];
                    var item_number = req.body['item_number'];
                    var payment_status = req.body['payment_status'];
                    var payment_amount = req.body['mc_gross'];
                    var payment_currency = req.body['mc_currency'];
                    var txn_id = req.body['txn_id'];
                    var receiver_email = req.body['receiver_email'];
                    var payer_email = req.body['payer_email'];

                    //Lets check a variable
                    log.infi("Checking variable");
                    log.infi("payment_status:", payment_status)
                    log.infi('\n\n');

                    // IPN message values depend upon the type of notification sent.
                    // To loop through the &_POST array and print the NV pairs to the screen:
                    log.infi('Printing all key-value pairs...')
                    for (var key in req.body) {
                        if (req.body.hasOwnProperty(key)) {
                            var value = req.body[key];
                            log.infi(key + "=" + value);
                        }
                    }

                    Payment.update(id, {status:"complete"}, function(status, data){
                        if (!status) {
                            log.infi('Success Complete', data);
                        }else
                            log.infi(data);
                    });

                } else if (body.substring(0, 7) === 'INVALID') {
                    // IPN invalid, log for manual investigation
                    log.infi('Invalid IPN!');
                    log.infi('\n\n');
                    Payment.update(id, {status:"error"}, function(status, data){
                        if (status)
                            log.infi(data);
                    });
                }

            }
        });
    });
}

module.exports.ipn_processor = ipn_processor;