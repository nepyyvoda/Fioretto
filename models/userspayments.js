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

    execute('SELECT ' +
        'userspayments.login, ' +
        'userspayments.sourceID, ' +
        'userspayments.receiverID, ' +
        'userspayments.servicesPaymentID, ' +
        'userspayments.servicesID, ' +
        'userspayments.start_time, ' +
        'userspayments.end_time, ' +
        'userspayments.transactionTypeID, ' +
        'userspayments.statusPaymentID, ' +
        'userspayments.textStatus, ' +
        'userspayments.transactionID, ' +
        'userspayments.currencyID, ' +
        'userspayments.amount, ' +
        'userspayments.paymentSchemeID, ' +
        'userspayments.commission, ' +
        'transactiontype.name AS transaction_type, ' +
        'paymentservices.name AS payservice_name, ' +
        'services.name AS serv_name '  +
        'FROM userspayments, transactiontype, paymentservices, services ' +
        'WHERE userspayments.transactionTypeID = transactiontype.id ' +
        'AND userspayments.servicesPaymentID = paymentservices.id ' +
        'AND userspayments.servicesID = services.id ' +
        'AND userspayments.login = ? ' +
        'AND userspayments.end_time BETWEEN ? AND ? ' +
        'LIMIT ?,?',
        [obj.login, obj.end_time_from, obj.end_time_to, obj.sizeof, obj.sized], function(err, data){
            //console.log("MODEL data - ", data);
            if(data.length >= 0){
                callback (false, data);
            } else {
                callback (true, 'USER_NOT_FOUND');
            }
    });

    /*execute('SELECT * ' +
     'FROM userspayments JOIN transactiontype ON userspayments.transactionTypeID = transactiontype.id WHERE userspayments.login = ? AND userspayments.end_time BETWEEN ? AND ? LIMIT ?,?',
     [obj.login, obj.end_time_from, obj.end_time_to, obj.sizeof, obj.sized], function(err, data){
     //console.log("MODEL data - ", data);
     if(data.length >= 0){
     callback (false, data);
     } else {
     callback (true, 'USER_NOT_FOUND');
     }
     });*/
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
module.exports.history = history;