/**
 * Created by vitaliy on 22.07.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');
var log = require('../logger')(module);

var allowedUpdateColumns = [
    'status'
];

function create(user, amount, date, ch_id,  card_id, finger_print, status, callback){
    execute('INSERT INTO cardpay (user, amount, date, ch_id, card_id, finger_print, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user, amount, date, ch_id, card_id, finger_print, status],
        function(status, data) {
            callback(false, data.insertId);
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
    //log.info("PARAMS QUERY: " +  queryTemplate + " " + queryData);

    execute('UPDATE cardpay SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        if(data.affectedRows > 0){
            callback (false, data);
        } else {
            callback (true, 'PAYPALPAY_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE cardpay SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'PAYPALPAY_NOT_FOUND');
        }
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;