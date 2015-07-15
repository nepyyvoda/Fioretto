/**
 * Created by anton.nepyyvoda on 02.06.2015.
 */

var ScenariosModel = require('../models/usersscenarios');
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
    ScenariosModel.update(req.params.id, {}, function(err, data) {
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
    console.log(req.params.id);
    ScenariosModel.getScenario(req.params.id, function(err, data) {
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
    });
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