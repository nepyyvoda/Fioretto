/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');

var allowedUpdateColumns = [
    'nameScenario',
    'scriptScenario',
    'URL_target',
    'countTotal',
    'deleted',
    'mode',
    'resolution',
    'usersID'
];

function create(nameScenario, scriptScenario, URL_target, mode, resolution, userID, callback){
    execute('INSERT INTO usersscenarios (nameScenario, scriptScenario, URL_target, mode, resolution, usersID) VALUES (?, ?, ?, ?, ?, ?)',
        [nameScenario, scriptScenario, URL_target, mode, resolution, userID],
        function(err, data) {
            callback(false, data);
        }
    );
}

function getUserScenarios(userID, callback){
    console.log('EXECUTE');
    execute('SELECT * FROM usersscenarios WHERE `usersID` = ? AND `deleted` = 0',
        [userID],
        function(err, data) {
            console.log('DATA ARGUMENTS', arguments);
            callback(false, data);
        }
    );
}

function getScenario(id, callback) {
    execute('SELECT * FROM usersscenarios WHERE `id` = ? AND `deleted` = 0',
        [id],
        function(err, data) {
            callback(false, data);
        }
    );
}

function update(id, data, callback){
    var formattedData = formatter(id, data, allowedUpdateColumns);
    if(!formattedData) {
        callback (true, 'ILLEGAL_COLUMNS');
    }
    var queryTemplate = formattedData.template || '';
    var queryData = formattedData.data || [];
    execute('UPDATE usersscenarios SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SCENARIO_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE usersscenarios SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
        if(!err){
            callback (false, data);
        } else {
            callback (true, 'SCENARIO_NOT_FOUND');
        }
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
module.exports.getUserScenarios = getUserScenarios;
module.exports.getScenario = getScenario;