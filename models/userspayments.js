/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;
var formatter = require('./formatter/update');

var allowedUpdateColumns = [
    'end_time',
    'statusPaymentID',
    'textStatus',
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
        function(data) {
            callback(false, data);
        }
    );
}

/*function update(id, parametr, value, callback){
    execute('UPDATE userspayments SET ?? = ? WHERE `id` = ?', [parametr, value, id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'PAYMENT_NOT_FOUND');
        }
    });
}*/

function update(id, data, callback){
    var formattedData = formatter(id, data, allowedUpdateColumns);
    if(!formattedData) {
        callback (true, 'ILLEGAL_COLUMNS');
    }

    var queryTemplate = formattedData.template || '';
    var queryData = formattedData.data || [];
    //log.info("PARAMS QUERY: " +  queryTemplate + " || " + queryData +"||\n\n");
    execute('UPDATE userspayments SET ' + queryTemplate + ' WHERE `id` = ?', queryData, function(err, data){
        log.info("DATA userspayments: ", data);
        if(data.changedRows > 0){
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

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;