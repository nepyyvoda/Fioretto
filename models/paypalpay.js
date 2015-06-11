/**
 * Created by vitaliy on 03.06.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');
var log = require('../logger')(module);

/*    var Payment = new PaymentModel();
 Payment.user = user_data_from_ipn.user;
 Payment.amount = data_body['mc_gross'];
 Payment.date = data_body['payment_date'];
 Payment.ipn_track_id = data_body['ipn_track_id'];
 Payment.txn_id = data_body['txn_id'];
 Payment.status = 'start';*/

var allowedUpdateColumns = [
    'status'
];

function create(user, amount, date, ipn_track_id,  txn_id, callback){
    execute('INSERT INTO paypalpay (user, amount, date, ipn_track_id, txn_id) VALUES (?, ?, ?, ?, ?)',
        [user, amount, date, ipn_track_id, txn_id, 'start'],
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
    log.info("PARAMS QUERY: " +  queryTemplate + " || " + queryData +"||\n\n");
    //log.info("PARAMS QUERY: " +  queryTemplate + " " + queryData);

    execute('UPDATE paypalpay SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        log.info("DATA : ", data);
        if(data.affectedRows > 0){
            callback (false, data);
        } else {
            callback (true, 'PAYPALPAY_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE paypalpay SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
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