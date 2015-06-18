var log = require('../logger')(module);
var config = require('../config');
var mysql      = require('mysql');

//var mysqlModel = require('mysql-model');
//var AppModel = mysqlModel.createConnection({
//    host     : config.get('db:host'),
//    port     : config.get('db:port'),
//    user     : config.get('db:user'),
//    password : config.get('db:password'),
//    database : config.get('db:database')
//});
//module.exports = AppModel;
var connection = mysql.createConnection({
    host     : config.get('db:host'),
    port     : config.get('db:port'),
    user     : config.get('db:user'),
    password : config.get('db:password'),
    database : config.get('db:database')
});
connection.connect(function(err) {
    if (err) {
        if(err.fatal) {
            log.error('DB error. Connect: ' + err.stack);
        } else {
            log.warn('DB error. Connect: ' + err.stack);
        }
        return;
    }

    log.info('Connected as id ' + connection.threadId);
});

connection.on('error', function(err) {
    console.log('SQL ERR', err);
    if(err.fatal) {
        log.error('DB error. ' + err.code + ': ' + err.stack);
    } else {
        log.warn('DB error. ' + err.code + ': ' + err.stack);
    }
});
/*
* param query (String)
* param inserts (Array)
* */
function execute(query, inserts, callback) {
    var sql = query;//"SELECT * FROM ?? WHERE ?? = ?";
    //var inserts = ['users', 'id', userId];
    sql = mysql.format(sql, inserts);
    console.log(sql);
    connection.query({sql: sql, timeout: config.get('db:queryTimeout')}, function(err, data) {
        console.log(sql, err);
        if(err) {
            callback(err);
            log.warn('DB error. ' + err.code + ': ' + err.stack);
        } else {
            log.info('DB req: '+ sql + ' returned' + JSON.stringify(data));
            callback(err, data);
        }
    })
}

module.exports.execute = execute;