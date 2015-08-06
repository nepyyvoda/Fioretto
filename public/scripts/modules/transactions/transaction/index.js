/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout'], function($, ko) {
    return function () {
        var self = this;
        self.serviceId = ko.observable();
        self.amount = ko.observable();
        self.currency = ko.observable();
        self.type = ko.observable();
        self.transactionId = ko.observable();
        self.commission = ko.observable();
    };
});