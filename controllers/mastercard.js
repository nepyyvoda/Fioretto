/**
 * Created by vitaliy on 21.07.15.
 */
var Payment = require('../models/cardpay');
var UsersPayments = require('../models/userspayments');
var UserModel = require('../models/user');
var log = require('../logger')(module);
var stripe = require("stripe")(
    "sk_test_0nOXBDNjYpichpo8nPnprB9P"
);


function mc_pay_processor(req, res){

    console.log('>>>> ENTER : ', req.body.amount, req.body.id);

    var process_obj = {};

    process_obj.amount = parseInt(req.body.amount);
    process_obj.id = req.body.id;
    process_obj.userId = req.cookies.userId;

    stripe.charges.create({
        amount: process_obj.amount,
        currency: "usd",
        source: process_obj.id, // obtained with Stripe.js
        description: "Charge account"
    }, function(err, charge) {
        var pay_data = charge;
        console.log(charge);
        if(err === null){
            Payment.create(
                process_obj.userId,
                pay_data.amount,
                new Date((+pay_data.created)*1000),
                pay_data.id,
                pay_data.source.id,
                pay_data.source.fingerprint,
                pay_data.status,
                function(status, id){

                    if(!status){

                        UsersPayments.create(
                            process_obj.userId,     //login
                            process_obj.userId,     //sender
                            3,                      //system payment id
                            4,                      //system receive = '0'
                            0,                      //service, charge user amount
                            new Date(pay_data.created*1000),  //date created
                            new Date(pay_data.created*1000),  //date end
                            1,                      //type pay income = 1
                            2,                      //status payment
                            pay_data.status,        // text status
                            pay_data.id,            // transaction id in outer system
                            0,
                            pay_data.amount,
                            0,
                            0,
                            0x0,function(status, userpaymentid) {
                                console.log('>>>>>>>> HERE WRITE THAT id = ', process_obj.userId);
                                UserModel.get({id : process_obj.userId}, function(statusErr, data){
                                    if(!statusErr){
                                        var newBalance = +data[0].balance + pay_data.amount;
                                        UserModel.update({id : process_obj.userId, data : {balance: newBalance}}, function(statusErr, data){
                                            if(!statusErr){
                                                log.info("USER UPDATE SUCCESS! ");
                                                res.send('SUCCESS', {err : 0});
                                            }else{
                                                log.warn("USER NOT UPDATE SUCCESS! ");
                                                res.send('ERROR', {err : 1});
                                            }
                                        });
                                    }
                                });
                            });
                    }
                });
        } else {
            log.warn(" Payment Trouble ", err);
            res.status('ERROR').send({err : 1});
        }

    });
}

module.exports.mc_pay_processor = mc_pay_processor;