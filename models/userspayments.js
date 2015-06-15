/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');

var allowedUpdateColumns = [
    'end_time',
    'statusPaymentID',
    'textStatus',
    'amount',
    'deleted'
];

function create(login,
                sourceID,
                receiverID,
                servicesPaymentID,
                servicesID,
                start_time,
                end_time,
                transactionTypeID,
                statusPaymentID,
                textStatus,
                transactionID,
                currencyID,
                amount,
                paymentSchemeID,
                commission,
                deleted, callback){
    execute('INSERT INTO userspayments (login, ' +
        'sourceID, ' +
        'receiverID, ' +
        'servicesPaymentID, ' +
        'servicesID,' +
        'start_time, ' +
        'end_time,' +
        'transactionTypeID, ' +
        'statusPaymentID,' +
        'textStatus,' +
        'transactionID, ' +
        'currencyID, ' +
        'amount, ' +
        'paymentSchemeID, ' +
        'commission, ' +
        'deleted)' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [login, sourceID, receiverID, servicesPaymentID, servicesID, start_time, end_time, transactionTypeID, statusPaymentID, textStatus, transactionID, currencyID,
            amount,
            paymentSchemeID,
            commission,
            deleted],
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
    console.log("PARAMS QUERY: " +  queryTemplate + " || " + queryData +"||\n\n");
    execute('UPDATE userspayments SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        console.log('UsersPayments DATA UPDATE', data);
        if(data.affectedRows > 0){
            callback (false, data);
        } else {
            callback (true, 'USERPAYMENTS_NOT_FOUND');
        }
    });
}

function remove(id, callback){
    execute('UPDATE userspayments SET deleted = 1 WHERE `id` = ?', [id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'PAYMENT_NOT_FOUND')
        }
    });
}

function get(id, callback) {
    execute('SELECT ' +
     'login' +
    'sourceID, ' +
    'receiverID, ' +
    'servicesPaymentID, ' +
    'servicesID,' +
    'start_time, ' +
    'end_time,' +
    'transactionTypeID, ' +
    'statusPaymentID,' +
    'textStatus,' +
    'transactionID, ' +
    'currencyID, ' +
    'amount, ' +
    'paymentSchemeID, ' +
    'commission ' +
    'FROM userspayments WHERE `id` = ?', [id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'USER_NOT_FOUND');
        }
    });
}

function history(login, callback){
    execute('SELECT ' +
    'id, ' +
    'sourceID, ' +
    'receiverID, ' +
    'servicesPaymentID, ' +
    'servicesID,' +
    'start_time, ' +
    'end_time,' +
    'transactionTypeID, ' +
    'statusPaymentID,' +
    'textStatus,' +
    'transactionID, ' +
    'currencyID, ' +
    'amount, ' +
    'paymentSchemeID, ' +
    'commission ' +
    'FROM userspayments WHERE `login` = ?', [login], function(err, data){
        console.log("MODEL data - ", data);
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'USER_NOT_FOUND');
        }
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
module.exports.history = history;