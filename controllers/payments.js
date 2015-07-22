/**
 * Created by vitaliy on 12.06.15.
 */

var UsersPayments = require('../models/userspayments');
var response = require('../response');

function get(req, res){

}


function history(req, res){
    console.log(req.query.from + " : " + req.query.to + " : " + req.query.offset);
    var obj = {};
    obj.login = req.params.id;
    obj.end_time_from = req.query.from;
    obj.end_time_to = req.query.to;
    obj.offset = req.query.offset;
    obj.sized = req.query.sized;


    if(typeof obj.end_time_from == "undefined")
        obj.end_time_from = new Date(0);
    else
        obj.end_time_from = new Date(+obj.end_time_from);

    if(typeof obj.end_time_to == "undefined")
        obj.end_time_to = new Date();
    else
        obj.end_time_to = new Date(+obj.end_time_to);

    if(typeof obj.offset === "undefined")
        obj.offset = 0;
    else
        obj.offset = +obj.offset;

    if(typeof obj.sized === "undefined")
        obj.sized = 10;
    else
        obj.sized = +obj.sized;
    if(obj.end_time_from > obj.end_time_to) {
        var swap = obj.end_time_from;
        obj.end_time_from = obj.end_time_to;
        obj.end_time_to = swap;
    }
    console.log('Payments controller: obj -', obj);
    UsersPayments.history(obj, function(err, data){
        //console.log('Payments controller: data history -', data);
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