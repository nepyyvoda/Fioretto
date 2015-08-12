/**
 * Created by anton.nepyyvoda on 11.08.2015.
 */
var getWorkerStatus = require('../scenario-client').getStatus;

function getStatus(req, res) {
    getWorkerStatus(function(err, data) {
        if(!err) {
            console.log('getStatus', data);
        } else {
            //log this
        }
    });
}

module.exports.getStatus = getStatus;