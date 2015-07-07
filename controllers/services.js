/**
 * Created by vitaliy on 26.06.15.
 */

var UserModel = require('../models/user');
var UserServiceGrants = require('../models/userservicegrant');
var UserPayments = require('../models/userspayments');
var ServiceParams = require('../models/serviceparams');
var response = require('../response');

function availableBrowser(req, res){
    UserModel.get({id : req.params.id },  function(err, data) {
        console.log('AVAILABLEBROWSER ', data);
        if(!err) {
            if((data[0].serviceAvailable[0] & 1) !== 0){
                //res.send(response('SUCCESS', {available : 1}));

                UserServiceGrants.getActiveService({usersid: req.params.id, serviceid: 1, end_time: (new Date())},
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
    UserModel.get({id : req.body.userid },  function(err, users) {
        console.log('USER ', users);
        ServiceParams.selectByName({name: req.body.name}, function(err, settingsserv){
            if(!err){
                var result = users[0].balance - settingsserv[0].value_price;
                if(result > 0){
                    console.log('settingsserv ', settingsserv[0]);

                    UserServiceGrants.getActiveService({usersid: req.body.userid, serviceid: settingsserv[0].servicesID, end_time: (new Date())},
                        function(err, data){
                            console.log('DATA user ', data);
                            if(!err){
                                res.send(response('ERROR', {err : 1, message: 'U has active plan!'}));
                            } else {
                                console.log('Time : ' + settingsserv[0].value_duration);
                                var duration = new Date(+(new Date()) + settingsserv[0].value_duration);
                                console.log('Time_End : ' + duration);

                                UserServiceGrants.create({
                                        userid : req.body.userid,
                                        serviceid :  settingsserv[0].servicesID,
                                        active : 1,
                                        start_time : (new Date()),
                                        end_time : duration,
                                        deleted : 0 },
                                    function(err, data){
                                        console.log('DATA user  ', data[0]);

                                        UserModel.update({id: req.body.userid, data: {balance: result}}, function(err, data){
                                            console.log('USER update balance ', data);
                                            if(!err){

                                                UserPayments.create(req.body.userid,
                                                    0,
                                                    0,
                                                    2,
                                                    settingsserv[0].servicesID,
                                                    new Date(),
                                                    new Date(),
                                                    2,
                                                    0,
                                                    'complete',
                                                    0,
                                                    0,
                                                    settingsserv[0].value_price,
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
            } else {
                res.send(response('UNSUCCESS', {err : 1}))
            }
        });
    });
}

module.exports.availableBrowser = availableBrowser;
module.exports.priceServices = priceServices;
module.exports.buyService = buyService;