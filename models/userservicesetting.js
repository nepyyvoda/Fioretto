/**
 * Created by vitaliy on 17.04.15.
 */

var execute = require('../db').execute;

function create(servsetid, userid){
    execute('INSERT INTO userservicesettings (serviceSettingsID, usersID) VALUES (?, ?)',
        [userscenid, countryid, count],
        function(data) {
            callback(false, data);
        }
    );
}

function update(id, parametr, value, callback){
    execute('UPDATE userservicesettings SET ?? = ? WHERE `id` = ?', [parametr, value, id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'COUNTRY_SCENARIO_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE userservicesettings SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'COUNTRY_SCENARIO_NOT_FOUND')
        }
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;