/**
 * @author Vitaliy Kovalchuk, created on 07.08.2015.
 */

var ServiceSettings = require('../models/serviceparams');
var response = require('../response');

function create(req, res) {

    ServiceSettings.create(req.body, function (err, data) {
        if (err) {
            res.send(response('INTERNAL_SERVER_ERROR'));
        } else {
            res.send(response('SUCCESS'));
        }
    })

}

function getAll(req, res) {

    ServiceSettings.get(function (err, data) {
        if (err || !data) {
            res.send(response('INTERNAL_SERVER_ERROR'));
        } else {
            res.send(response('SUCCESS', data));
        }
    })

}

function getByKey(req, res) {

    ServiceSettings.getSortedByKey(req.params.key, function (err, data) {
        if (err || !data) {
            res.send(response('INTERNAL_SERVER_ERROR'));
        } else {
            res.send(response('SUCCESS', data));
        }
    })


}

function update(req, res) {
    ServiceSettings.update(req.body, function (err, data) {
        if (err) {
            res.send(response('INTERNAL_SERVER_ERROR'));
        } else {
            res.send(response('SUCCESS'));
        }
    })


}

function remove(req, res) {

    ServiceSettings.remove(req.params.name, function (err, data) {
        if (err) {
            res.send(response('INTERNAL_SERVER_ERROR'));
        } else {
            res.send(response('SUCCESS'));
        }
    })


}

module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getByKey = getByKey;
module.exports.update = update;
module.exports.remove = remove;