/**
 * Created by anton.nepyyvoda on 02.06.2015.
 */
var execute = require('../db').execute;
var formatter = require('./formatter/update');

var allowedUpdateColumns = [
    'name',
    'ip',
    'port',
    'threads'
];

function create(name, ip, port, cores){
    execute('INSERT INTO nodes (name, ip, port, threads) VALUES (?, ?, ?, ?)',
        [name, ip, port, cores],
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
    execute('UPDATE nodes SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'NODE_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE nodes SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'NODE_NOT_FOUND');
        }
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;