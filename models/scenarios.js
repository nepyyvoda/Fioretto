/**
 * Created by anton.nepyyvoda on 02.06.2015.
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
    'userID'
];

function create(nameScenario, scriptScenario, URL_target, mode, resolution, userID, callback){
    execute('INSERT INTO userscenarios (nameScenario, scriptScenario, URL_target, mode, resolution, userID) VALUES (?, ?, ?, ?, ?, ?)',
        [nameScenario, scriptScenario, URL_target, mode, resolution, userID],
        function(data) {
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
    execute('UPDATE userscenarios SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SCENARIO_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE userscenarios SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'SCENARIO_NOT_FOUND');
        }
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;