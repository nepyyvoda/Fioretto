/**
 * Created by vitaliy on 26.06.15.
 */

var UserModel = require('../models/user');
var UserServiceGrants = require('../models/userservicegrant');
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

}

module.exports.availableBrowser = availableBrowser;