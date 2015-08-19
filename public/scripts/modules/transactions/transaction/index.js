/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout'], function ($, ko) {
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

        self.globalId =  ko.observable(data.globalId);

        self.id = ko.observable(data.id);

        self.userId = ko.observable(data.login);

        self.transactionId = ko.observable(data.transactionID);

        self.servicesPaymentID = ko.observable(data.servicesPaymentID);

        self.serviceId = ko.observable(data.servicesID);

        self.amount = ko.observable(data.amount);
        self.amountFormatting = ko.pureComputed({
            read: function () {

                return (self.amount() / 100).toFixed(2);
            },
            write: function (value) {

                if (value >= 0 && !isNaN(value)) {
                    self.amount(null);
                    self.amount(value * 100);
                } else {
                    var tmp = self.amount();
                    self.amount(null);
                    self.amount(tmp);
                }
            },
            owner: this
        });

        self.type = ko.observable(data.transactionTypeID);

        self.status = ko.observable(data.textStatus);

        self.statusPaymentID = ko.observable(data.statusPaymentID);

        self.currency = ko.observable(data.currencyID);
        self.currencyPrintable = ko.computed(function () {
            var currencyName = 'USD';
            switch (self.currency()) {
                case 1:
                    currencyName = 'USD';
                    break;
                case 2:
                    currencyName = 'EURO';
                    break;
                case 3:
                    currencyName = 'UAH';
                    break;
                case 4:
                    currencyName = 'RUB';
                    break;
            }
            return currencyName;
        });

        self.commission = ko.observable(data.commission);

        self.performDate = ko.observable(data.end_time);
        self.performDatePrintable = ko.pureComputed({
                read: function () {
                    var date = new Date(self.performDate());
                    return date.toString();
                },
                write: function (value) {

                    var parse = Date.parse(value);

                    if (isNaN(parse)) {
                        value = self.performDate();
                        self.performDate(null)
                    }
                    self.performDate(new Date(value));
                },
                owner: this
            }
        );

        self.deleted = data.deleted.data[0];
    };
});