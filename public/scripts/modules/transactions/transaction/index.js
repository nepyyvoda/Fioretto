/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout'], function($, ko) {
    return function (data) {
        var self = this;
        //
        //login
        //sourceID
        //receiverID
        //servicesPaymentID
        //servicesID
        //start_time
        //end_time
        //transactionTypeID
        //statusPaymentID
        //textStatus
        //transactionID
        //currencyID
        //amount
        //paymentSchemeID
        //commission

        self.serviceId = ko.observable(data.servicesID);
        self.amount = ko.observable(data.amount);
        self.currency = ko.observable(data.currencyID);
        self.type = ko.observable(data.transactionTypeID);
        self.transactionId = ko.observable(data.transactionID);
        self.commission = ko.observable(data.commission);
        self.performDate = ko.observable(data.end_time);
        self.userId = ko.observable(data.login);
        self.status = ko.observable(data.textStatus);
    };
});