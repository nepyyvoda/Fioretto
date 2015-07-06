/**
 * Created by vitaliy on 17.04.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');

var allowedUpdateColumns = [
    'servicesID',
    'name',
    'value',
    'active'
];

function create(obj, callback){
    execute('INSERT INTO servicesettings (servicesID, name, value, active) VALUES (?, ?)',
        [obj.servicesID, obj.name, obj.value, obj.active],
        function(data) {
            callback(false, data);
        }
    );
}

function update(obj, callback){
    execute('UPDATE servicesettings SET ?? = ? WHERE `id` = ?', [obj.parametr, obj.value, obj.id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SERVICE_SETTINGS_NOT_FOUND');
        }
    });
}

function remove(obj, callback){
    execute('UPDATE servicesettings SET deleted = 1 WHERE `id` = ?', [obj.id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SERVICE_SETTINGS_NOT_FOUND')
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
module.exports.update = update;
module.exports.remove = remove;
module.exports.selectByServices = selectByServices;
module.exports.selectByName = selectByName;