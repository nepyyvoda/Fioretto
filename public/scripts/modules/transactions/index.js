/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', 'transaction/index'], function($, ko, TransactionModel) {
    return function () {
        var self = this;
        self.transactions = ko.observableArray();
        self.offset = ko.observable();
        self.limit = ko.observable();
        self.from = ko.observable();
        self.to = ko.observable();
        self.getList = function() {

        }
    };
});