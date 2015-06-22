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

function history(obj, callback){

    if(typeof obj.end_time_from == "undefined")
        obj.end_time_from = new Date(0);
    else
        obj.end_time_from = new Date(+obj.end_time_from);

    if(typeof obj.end_time_to == "undefined")
        obj.end_time_to = new Date();
    else
        obj.end_time_to = new Date(+obj.end_time_to);

    if(typeof obj.sized == "undefined")
        obj.sized = 10;
    if(typeof obj.sizeof == "undefined")
        obj.sizeof = 0;
    if(obj.end_time_from > obj.end_time_to){
        var swap = obj.end_time_from;
        obj.end_time_from = obj.end_time_to;
        obj.end_time_to = swap;
    }

    execute('SELECT * ' +
    'FROM userspayments JOIN transactiontype ON userspayments.transactionTypeID = transactiontype.id WHERE userspayments.login = ? AND userspayments.end_time BETWEEN ? AND ? LIMIT ?,?',
        [obj.login, obj.end_time_from, obj.end_time_to, obj.sizeof, obj.sized], function(err, data){
        //console.log("MODEL data - ", data);
        if(data.length >= 0){
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