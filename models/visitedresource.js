/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;

function create(userid, countryscenraioid, count){
    execute('INSERT INTO visitedresource (usersID, countryScenariosID, countRemain) VALUES (?, ?, ?)',
        [userid, namescen, scriptscen, url, count],
        function(data) {
            callback(false, data);
        }
    );
}

function update(id, parametr, value, callback){
    execute('UPDATE visitedresource SET ?? = ? WHERE `id` = ?', [parametr, value, id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SCENARIO_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE visitedresource SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
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