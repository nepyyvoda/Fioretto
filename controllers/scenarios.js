/**
 * Created by anton.nepyyvoda on 02.06.2015.
 */

var ScenariosModel = require('../models/usersscenarios');
var UserModel = require('../models/user');
var ServiceParams = require('../models/serviceparams');
var UserServiceGrants = require('../models/userservicegrant');
var UserPayments = require('../models/userspayments');
var response = require('../response');
var config = require('../config');
var log = require('../logger')(module);
var scenarioClient = require('../scenario-client');
var scriptBuilder = require('../script-builder').scriptBuild;

var availableModes = {
    tor: 0,
    proxy: 1
};

function create(req, res) {
    var iterations = parseInt(req.body.count, 10);
    if(isNaN(iterations)) {
        iterations = 0;
    }

    ScenariosModel.create(req.body.name, (JSON.stringify(req.body.chain)).toString(), req.body.url, req.body.mode || 0, JSON.stringify(req.body.resolution), req.cookies.userId , iterations, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function rename(req, res) {

}

function update(req, res) {
    console.log("REQ DATA -- ", req.body);

    ScenariosModel.update(req.body.id, req.body.data, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data[0]));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function changeMode(req, res) {

}

function getScenario(req, res) {
    ScenariosModel.getScenario(req.params.id, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data[0]));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function getScenarios(req, res) {
    ScenariosModel.getUserScenarios(req.cookies.userId, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function del(req, res) {
    ScenariosModel.remove(req.params.id, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function startScenario(req, res) {
    console.log(req.cookies.userId);
    var servName = ['scenario_tor','scenario_proxy'];


    UserModel.get({id: req.cookies.userId}, function(err, user){
        console.log('startScenario - user', user);
        if(!err){

            ScenariosModel.getScenario(req.params.id, function(err, scenarios) {
                console.log('startScenario - user - scenario', scenarios);
                if(!err) {
                    var scenario = scenarios[0];
                    var neededDataForVoting = {};

                    ServiceParams.selectByName({name: servName[scenario.mode]}, function(err, params){
                        console.log('startScenario - user - scenario - params', params);
                        if(!err){
                            var param = params[0];
                            var result = user[0].balance - scenario.countTotal * param.value_price

                            if(result >= 0){
                                UserServiceGrants.create({userid : user[0].id, serviceid : 2, active : 1, start_time : new Date(), end_time : new Date(), control_option : scenario.countTotal, deleted : 0}, function(err, usergrants){
                                    if(!err) {
                                        UserPayments.create(
                                            user[0].id,     //sender
                                            user[0].id,     //receiver
                                            0,              //
                                            2,              //payment system - internal = 2
                                            2,
                                            new Date(),
                                            new Date(),
                                            2,
                                            0,
                                            'complete',
                                            0,
                                            0,
                                            scenario.countTotal * param.value_price,
                                            0,
                                            0,
                                            0,
                                            function(err, payments){
                                                console.log('startScenario - user - scenario - params - servgrants', payments);
                                                if(!err){
                                                    UserModel.update({id: user[0].id, data : { balance : result }}, function(err, data){
                                                        console.log('startScenario - user - scenario - params - user upd', data);

                                                        if(!err){

                                                            var script = scriptBuilder({
                                                                url: scenario.URL_target,
                                                                resolution: scenario.resolution,
                                                                eventsChain: JSON.parse(scenario.scriptScenario)
                                                            });
                                                            neededDataForVoting.vote = {
                                                                name: scenario.nameScenario,
                                                                votes: scenario.countTotal,
                                                                mode: scenario.mode,
                                                                url: scenario.URL_target,
                                                                resolution: scenario.resolution,
                                                                eventsChain: JSON.parse(scenario.scriptScenario)
                                                            };
                                                            neededDataForVoting.scenario = script;
                                                            neededDataForVoting.node = {
                                                                ip: config.get('workerServer:ip'),
                                                                port: config.get('workerServer:port')
                                                            };
                                                            neededDataForVoting.scenarioId = req.params.id;
                                                            console.log(neededDataForVoting);
                                                            scenarioClient.sendToNodeVoting(neededDataForVoting, res, sender);

                                                        } else {
                                                            res.send(response('ERROR', data));
                                                        }
                                                    });
                                                } else {
                                                    res.send(response('ERROR', payments));
                                                }
                                            }
                                        );
                                    } else {
                                        res.send(response('ERROR', usergrants));
                                    }
                                });

                            } else {
                                res.send(response('ERROR', 'NOT HAVE SO MUCH MONEY!'));
                            }
                        } else {
                            res.send(response('ERROR', params));
                        }
                    });
                } else {
                    res.send(response('ERROR', scenarios));
                }
            });
        } else {
            res.send(response('ERROR', user));
        }
    });
    /*ScenariosModel.getScenario(req.params.id, function(err, data) {
        if(!err) {
            var scenario = data[0];
            var neededDataForVoting = {};

            var script = scriptBuilder({
                url: scenario.URL_target,
                resolution: scenario.resolution,
                eventsChain: JSON.parse(scenario.scriptScenario)
            });
            neededDataForVoting.vote = {
                name: scenario.nameScenario,
                votes: scenario.countTotal,
                mode: scenario.mode,
                url: scenario.URL_target,
                resolution: scenario.resolution,
                eventsChain: JSON.parse(scenario.scriptScenario)
            };
            neededDataForVoting.scenario = script;
            neededDataForVoting.node = {
                ip: config.get('workerServer:ip'),
                port: config.get('workerServer:port')
            };
            neededDataForVoting.scenarioId = req.params.id;
            console.log(neededDataForVoting);
            scenarioClient.sendToNodeVoting(neededDataForVoting, res, sender);
        }
    });*/
}

var sender = {};

sender.err = callSendError;
sender.data = callSendData;

function callSendData(msg, res, data){
    res.send(response('SUCCESS', data));
}

function callSendError(msg, res){
    res.send(response('INTERNAL_SERVER_ERROR', data));
}

function changeState(req, res) {
    ScenariosModel.update(req.params.id, {
        status: req.body.status
    }, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data[0]));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

module.exports.create = create;
module.exports.rename = rename;
module.exports.update = update;
module.exports.del = del;
module.exports.getScenario = getScenario;
module.exports.getScenarios = getScenarios;
module.exports.startScenario = startScenario;
module.exports.changeState = changeState;
