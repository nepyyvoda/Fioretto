/**
 * Created by vitaliy on 26.06.15.
 */

var UserModel = require('../models/user');
var UserServiceGrants = require('../models/userservicegrant');
var UserPayments = require('../models/userspayments');
var ServiceParams = require('../models/serviceparams');
var response = require('../response');

var servicesAvailable = [NaN,1,2,4];

function availableBrowser(req, res){

    UserModel.get({id : req.params.id },  function(err, data) {
        console.log('AVAILABLEBROWSER ', data);
        if(!err) {
            if((data[0].serviceAvailable[0] & servicesAvailable[req.params.servicesid]) !== 0){
                //res.send(response('SUCCESS', {available : 1}));

                UserServiceGrants.getActiveService({usersid: req.params.id, serviceid: req.params.servicesid, end_time: (new Date())},
                function(err, data){
                    if(!err){
                        res.send(response('SUCCESS', {available : 1, end_time: (new Date(data[0].end_time))}));
                    } else {
                        res.send(response('SUCCESS', {available : 0}))
                    }

                });
            }else
                res.send(response('SUCCESS', {available : 0}));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function availableScenario(req, res){}

function availableSMS(req, res){}

function priceServices(req, res){
    ServiceParams.selectByServices({servicesid: req.params.servicesid}, function(err, data){
        if(!err){
            res.send(response('SUCCESS', {err : 0, result: data}));
        } else {
            res.send(response('SUCCESS', {err : 1}))
        }
    });
}

function buyService(req, res){
    var processingObject = {};
    processingObject.userid = req.body.userid;
    processingObject.name = req.body.name;
    processingObject.count = req.body.count;
    processingObject.user = {};
    processingObject.result = {};
    processingObject.settingsserv = {};


    UserModel.get({id : processingObject.userid },  function(err, users) {
        console.log('USER ', users);
        processingObject.user = users[0];

        ServiceParams.selectByName({name: processingObject.name}, function(err, settingsserv){
            if(!err){
                processingObject.settingsserv = settingsserv[0];

                if(processingObject.name.indexOf('browser') === 0){
                    buyServiceBrowser(req, res, processingObject);
                } else if (processingObject.name.indexOf('scenario') === 0 && (typeof processingObject.count !== 'undefined' || processingObject.count !== 0)){
                    buyServiceVote(req, res, processingObject);
                }

            } else {
                res.send(response('UNSUCCESS', {err : 1}))
            }
        });
    });
}

function buyServiceBrowser(req, res, processingObject){
    console.log('rocessingObject.user.balance - ' + processingObject.user.balance + ' : processingObject.settingsserv.value_price -- ' + processingObject.settingsserv.value_price);

    processingObject.result = processingObject.user.balance - processingObject.settingsserv.value_price;
    console.log('result ', processingObject);

    if(processingObject.result > 0){
        console.log('settingsserv ', processingObject.settingsserv);
        //Check that service browser is active
        UserServiceGrants.getActiveService({usersid: processingObject.userid,
                serviceid: processingObject.settingsserv.servicesID,
                end_time: (new Date())},
            function(err, data){
                console.log('DATA user ', data);

                if(!err){
                    res.send(response('ERROR', {err : 1, message: 'U has active plan!'}));
                } else {
                    var duration = new Date(+(new Date()) + processingObject.settingsserv.value_duration);

                    UserServiceGrants.create({
                            userid : processingObject.userid,
                            serviceid :  processingObject.settingsserv.servicesID,
                            active : 1,
                            start_time : (new Date()),
                            end_time : duration,
                            control_option : duration,
                            deleted : 0 },
                        function(err, data){
                            console.log('DATA user  ', data[0]);

                            UserModel.update({id: processingObject.userid, data: {balance: processingObject.result}}, function(err, data){
                                console.log('USER update balance ', data);
                                if(!err){

                                    UserPayments.create(processingObject.userid,
                                        0,
                                        0,
                                        2,
                                        processingObject.settingsserv.servicesID,
                                        new Date(),
                                        new Date(),
                                        2,
                                        0,
                                        'complete',
                                        0,
                                        0,
                                        processingObject.settingsserv.value_price,
                                        0,
                                        0,
                                        0x0, function(err, retData){
                                            console.log(retData);
                                            if(!err)
                                                res.send(response('SUCCESS', {err : 0, data : retData}));
                                            else
                                                res.send(response('UNSUCCESS', {err : 1}));
                                        });
                                }else{
                                    res.send(response('UNSUCCESS', {err : 1}));
                                }
                            });
                        })
                }
            }
        );

    }else{
        res.send(response('UNSUCCESS', {err : 1}));
    }
}

function buyServiceVote(req, res, processingObject){
    processingObject.result = processingObject.user.balance - processingObject.settingsserv.value_price * processingObject.count;

    //Have user needed balance?
    if(processingObject.result > 0){
        console.log(':buyServiceVote : settingsserv ', processingObject.settingsserv);

        //Check that service vote is active
        UserServiceGrants.getActiveService({usersid: processingObject.userid,
                serviceid: processingObject.settingsserv.servicesID,
                end_time: (new Date())},
            function(err, activeserviceret){
                console.log('DATA user ', activeserviceret);
                processingObject.activeserviceret = activeserviceret[0];

                var duration = new Date(+(new Date()) + processingObject.settingsserv.value_duration);
                console.log(':buyServiceVote : getActiveService ', processingObject);
                //has active order?
                if(!err){
                    //Deactivated previous
                    UserServiceGrants.update({id: processingObject.activeserviceret.id, data: {active : 0}}, function(err, dataUpd){
                        if(!err){
                            console.log(':buyServiceVote : update ', processingObject);
                            var newControlOption = processingObject.activeserviceret.control_option + processingObject.count;
                            //Create new order
                            UserServiceGrants.create({
                                    userid : processingObject.userid,
                                    serviceid :  processingObject.settingsserv.servicesID,
                                    active : 1,
                                    start_time : (new Date()),
                                    end_time : duration,
                                    control_option : newControlOption,
                                    deleted : 0 },
                                function(err, data){
                                    console.log(':buyServiceVote : DATA user  ', data[0]);
                                    //Update user balance
                                    UserModel.update({id: processingObject.userid, data: {balance: processingObject.result}}, function(err, data){
                                        console.log('USER update balance ', data);
                                        if(!err){

                                            UserPayments.create(processingObject.userid,
                                                0,
                                                0,
                                                2,
                                                processingObject.settingsserv.servicesID,
                                                new Date(),
                                                new Date(),
                                                2,
                                                0,
                                                'complete',
                                                0,
                                                0,
                                                processingObject.settingsserv.value_price,
                                                0,
                                                0,
                                                0x0, function(err, retData){
                                                    console.log(retData);
                                                    if(!err)
                                                        res.send(response('SUCCESS', {err : 0, data : retData}));
                                                    else
                                                        res.send(response('UNSUCCESS', {err : 1}));
                                                });
                                        }else{
                                            res.send(response('UNSUCCESS', {err : 1}));
                                        }
                                    });
                                }
                            );
                        } else {
                            res.send(response('UNSUCCESS', {err : 1}));
                        }
                    });
                } else {
                    //Create new order
                    UserServiceGrants.create({
                            userid : processingObject.userid,
                            serviceid :  processingObject.settingsserv.servicesID,
                            active : 1,
                            start_time : (new Date()),
                            end_time : duration,
                            control_option : processingObject.count,
                            deleted : 0 },
                        function(err, data){
                            console.log(':buyServiceVote : DATA user, else : ', data[0]);
                            //Update user balance
                            UserModel.update({id: processingObject.userid, data: {balance: processingObject.result}}, function(err, data){
                                console.log(':buyServiceVote : USER update balance ', data);
                                if(!err){

                                    UserPayments.create(processingObject.userid,
                                        0,
                                        0,
                                        2,
                                        processingObject.settingsserv.servicesID,
                                        new Date(),
                                        new Date(),
                                        2,
                                        0,
                                        'complete',
                                        0,
                                        0,
                                        processingObject.settingsserv.value_price,
                                        0,
                                        0,
                                        0x0, function(err, retData){
                                            console.log(retData);
                                            if(!err)
                                                res.send(response('SUCCESS', {err : 0, data : retData}));
                                            else
                                                res.send(response('UNSUCCESS', {err : 1}));
                                        });
                                }else{
                                    res.send(response('UNSUCCESS', {err : 1}));
                                }
                            });
                        }
                    );
                }
            }
        );

    }else{
        res.send(response('UNSUCCESS', {err : 1}));
    }
}

module.exports.availableBrowser = availableBrowser;
module.exports.priceServices = priceServices;
module.exports.buyService = buyService;