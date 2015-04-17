/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;

function create(userscenid, countryid, count){
    execute('INSERT INTO countryscenarios (UsersScenariosID, countryID, count) VALUES (?, ?, ?)',
        [userscenid, countryid, count],
        function(data) {
            callback(false, data);
        }
    );
}

function update(id, parametr, value, callback){
    execute('UPDATE countryscenarios SET ?? = ? WHERE `id` = ?', [parametr, value, id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'COUNTRY_SCENARIO_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE countryscenarios SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
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