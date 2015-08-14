/**
 * Created by vitaliy on 17.04.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');

var allowedUpdateColumns = [
    'servicesID',
    'name',
    'value_price',
    'active',
    'value_duration'
];

function create(obj, callback) {
    execute('INSERT INTO servicesettings (servicesID, name, value_price, active, value_duration) VALUES (?, ?, ?, ?, ?)',
        [obj.id, obj.name, obj.value, obj.active, obj.duration],
        function (data) {
            callback(false, data);
        }
    );
}

function get(callback) {
    execute('SELECT `id` ,`servicesID` as `servicesID`, `name`, `value_price` as `price` , `active`, `value_duration` as `duration` FROM servicesettings',[], function (err, data) {

        if (data !== undefined && data.length > 0) {
            callback(false, data);
        } else {
            callback(true, 'SERVICE_SETTINGS_NOT_FOUND');
        }
    });
}

function getSortedByKey(key, callback) {
    execute('SELECT `id` ,`servicesID` as `servicesID`, `name`, `value_price` as `price` , `active`, `value_duration` as `duration` FROM servicesettings ORDER BY ?',
        [key], function (err, data) {
            if (data !== undefined && data.length > 0) {
                callback(false, data);
            } else {
                callback(true, 'SERVICE_SETTINGS_NOT_FOUND');
            }
        });
}

function update(obj, callback) {

    var formattedData = formatter(obj.id, obj.data, allowedUpdateColumns);


    if(!formattedData) {
        callback (true, 'ILLEGAL_COLUMNS');
    }
    var queryTemplate = formattedData.template || '';
    var queryData = formattedData.data || [];

    execute('UPDATE servicesettings SET  '+ queryTemplate + ' WHERE `id` = ?', queryData, function (err, data) {
        if (data !== undefined && data.length > 0) {
            callback(false, data);
        } else {
            callback(true, 'SERVICE_SETTINGS_NOT_FOUND');
        }
    });
}

function remove(name, callback) {
    execute('DELETE FROM servicesettings WHERE `name` = ?', [name], function (err, data) {

        if (data !== undefined && data.length > 0) {
            callback(false, data);
        } else {
            callback(true, 'SERVICE_SETTINGS_NOT_FOUND')
        }
    });
}


function selectByServices(obj, callback){
    execute('SELECT * FROM servicesettings WHERE servicesID = ?', [obj.servicesid], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SERVICE_SETTINGS_NOT_FOUND')
        }
    });
}

function selectByName(obj, callback){
    execute('SELECT * FROM servicesettings WHERE name = ?', [obj.name], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SERVICE_SETTINGS_NOT_FOUND')
        }
    });
}

module.exports.create = create;
module.exports.get = get;
module.exports.getSortedByKey = getSortedByKey;
module.exports.update = update;
module.exports.remove = remove;
module.exports.selectByServices = selectByServices;
module.exports.selectByName = selectByName;