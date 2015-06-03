/**
 * Created by anton.nepyyvoda on 02.06.2015.
 */
var ScenariosModel = require('../models/scenarios');
var response = require('../response');
var config = require('../config');
var log = require('../logger')(module);

var availableModes = {
    tor: 0,
    proxy: 1
};

function create(req, res) {
    ScenariosModel.get(req.params.id, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data[0]));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function rename(req, res) {

}

function update(req, res) {

}

function changeMode(req, res) {

}

function get(req, res) {
    ScenariosModel.get(req.params.id, function(err, data) {
        if(!err) {
            res.send(response('SUCCESS', data[0]));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function del(req, res) {
    ScenariosModel.get(req.params.id, function(err, data) {
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
module.exports.get = get;