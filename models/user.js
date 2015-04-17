/**
 * Created by anton.nepyyvoda on 15.04.2015.
 */
var execute = require('../db').execute;

function register(login, email, password, callback) {
    execute('SELECT * FROM users WHERE `email` = ? OR `login` = ?', [email, login], function(err, data) {
        if(data.length > 0) {
            callback(true, 'USER_ALREADY_EXIST');
        } else {
            execute('INSERT INTO users (email, login, password, active) VALUES (?, ?, ?, 0)', [email, login, password], function(data) {
                callback(false, data);
            });
        }
    });
}

function login(login, password, callback) {
    execute('SELECT * FROM users WHERE `email` = ? OR `login` = ? AND `password` = ? AND `active` = 1', [login, login, password], function(err, data) {
        var queryData = data || [];
        if(queryData.length > 0) {
            callback(false, queryData);
        } else {
            callback(true, 'USER_NOT_FOUND');
        }
    });
}

function activateUser(email, callback) {
    execute('UPDATE users SET `active` = 1 WHERE `email` = ?', [email], function(err, data) {
        var queryData = data || [];
        if(!err) {
            callback(false, queryData);
        } else {
            callback(true, 'USER_NOT_FOUND');
        }
    });
}

function deactivateUser(email, callback) {
    execute('UPDATE users SET (`active` = 0) WHERE `email` = ?', [email], function(err, data) {
        var queryData = data || [];
        if(!err) {
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
module.exports.activateUser = activateUser;
module.exports.deactivateUser = deactivateUser;
module.exports.remove = remove;
module.exports.update = update;