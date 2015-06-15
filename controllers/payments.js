/**
 * Created by vitaliy on 12.06.15.
 */

var UsersPayments = require('../models/userspayments');
var response = require('../response');

function get(req, res){

}


function history(req, res){
    UsersPayments.history(req.params.login, function(err, data){
        console.log('Payments controller: data history -', data);
        if(!err) {
            res.send(response('SUCCESS', data));
        } else {
            res.send(response('INTERNAL_SERVER_ERROR', data));
        }
    });
}

function update(req, res){

}

function remove(req, res){

}

module.exports.get = get;
module.exports.update = update;
module.exports.remove = remove;
module.exports.history = history;