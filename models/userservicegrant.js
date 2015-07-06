/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;

function create(obj, callback){
    execute('INSERT INTO userservicesgrants (usersID, serviceID, active, start_time, end_time, deleted) VALUES (?, ?, ?, ?, ?, ?)',
        [obj.userid, obj.serviceid, obj.active, obj.start_time, obj.end_time, obj.deleted],
        function(err, data) {

            callback(false, data);
        }
    );
}

function update(obj, callback){
    execute('UPDATE userservicesgrants SET ?? = ? WHERE `id` = ?', [obj.parametr, obj.value, obj.id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'USERSERVICEGRANTS_NOT_FOUND');
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