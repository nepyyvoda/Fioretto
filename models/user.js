/**
 * Created by anton.nepyyvoda on 15.04.2015.
 */
var execute = require('../db').execute;

function register(login, email, password, callback) {
    execute('SELECT * FROM users WHERE `email` = ? OR `login` = ?', [email, login], function(err, data) {
        if(data.length > 0) {
            callback(true, 'USER_ALREADY_EXIST');
        } else {
            execute('INSERT INTO users (email, login, password) VALUES (?, ?, ?)', [email, login, password], function(data) {
                callback(false, data);
            });
        }
    });
}

function login(login, password, callback) {
    execute('SELECT * FROM users WHERE `email` = ? OR `login` = ? AND `password` = ?', [login, login, password], function(err, data) {
        console.log('LOGIN', arguments);
        var queryData = data || [];
        if(queryData.length > 0) {
            callback(false, queryData);
        } else {
            callback(true, 'USER_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE users SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'USER_NOT_FOUND')
        }
    });
}

function update(id, parametr, value, callback){
    execute('UPDATE users SET ?? = ? WHERE `id` = ?', [parametr, value, id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'USER_NOT_FOUND');
        }
    });
}

module.exports.register = register;
module.exports.login = login;