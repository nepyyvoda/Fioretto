/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');

var allowedUpdateColumns = [
    'active',
    'control_option',
    'deleted'
];

function create(obj, callback){
    execute('INSERT INTO userservicesgrants (usersID, serviceID, active, start_time, end_time, control_option, deleted) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [obj.userid, obj.serviceid, obj.active, obj.start_time, obj.end_time, obj.control_option, obj.deleted],
        function(err, data) {

            callback(false, data);
        }
    );
}

function update(obj, callback){
    var formattedData = formatter(obj.id, obj.data, allowedUpdateColumns);
    if(!formattedData) {
        callback (true, 'ILLEGAL_COLUMNS');
    }
    var queryTemplate = formattedData.template || '';
    var queryData = formattedData.data || [];
    execute('UPDATE userservicesgrants SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        if(data.affectedRows > 0){
            callback (false, data);
        } else {
            callback (true, 'USER_NOT_FOUND');
        }
    });
}

function remove(obj, callback){
    execute('UPDATE userservicesgrants SET deleted = 1 WHERE `id` = ?', [obj.id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'USERSERVICEGRANTS_NOT_FOUND')
        }
    });
}

function getByParam(obj, callback){
    execute('SELECT * FROM userservicesgrants WHERE ?? = ? AND `deleted` = 0', [obj.param, obj.value], function(err, data){
        var queryData = data || [];
        if(queryData.length > 0) {
            callback(false, queryData);
        } else {
            callback(true, 'USERSERVICEGRANTS_NOT_FOUND');
        }
    });
}

function getActiveService(obj, callback){
    execute('SELECT * FROM userservicesgrants WHERE ' +
    '`usersID` = ? ' +
    'AND `serviceID` = ?  ' +
    'AND `end_time` > ?' +
    'AND `active` = 1 ' +
    'AND `deleted` = 0', [obj.usersid, obj.serviceid, obj.end_time], function(err, data){
        var queryData = data || [];
        console.log("USERSERVICEGRANTS_getActiveService : ", queryData);
        if(queryData.length > 0) {
            callback(false, queryData);
        } else {
            callback(true, 'USERSERVICEGRANTS_NOT_FOUND');
        }
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
module.exports.getActiveService = getActiveService;