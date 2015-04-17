/**
 * Created by vitaliy on 16.04.15.
 */

var execute = require('../db').execute;

function create(login, sourceid, reciverid, servicepaymentid, starttime, transactiontypeid, transactionid, currencyid, amount, payschemid, commission){
    execute('INSERT INTO userspayments (login, sourceID, receiverID, servicesPaymentID, start_time, transactionTypeID, transactionID, currencyID, amount, paymentSchemeID, commission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [login, sourceid, reciverid, servicepaymentid, starttime, transactiontypeid, transactionid, currencyid, amount, payschemid, commission],
        function(data) {
            callback(false, data);
        }
    );
}

function update(id, parametr, value, callback){
    execute('UPDATE userspayments SET ?? = ? WHERE `id` = ?', [parametr, value, id], function(err, data){
        if(data.length > 0){
            callback (false, data);
        } else {
            callback (true, 'PAYMENT_NOT_FOUND');
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