/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './transaction/index'], function($, ko, TransactionModel) {
    function GetParams() {
        var self = this;
        self.params = [];
        self.push = function(object) {
            self.params.push(object);
            console.log(self.params);
        };
        self.pop = function() {
            return self.params.pop();
        };
        self.get = function() {
            if(self.params.length >= 0) {
                var q = '?';
                for(var i = 1; i <= self.params.length; i++) {
                    if(i === self.params.length) {
                        q += Object.keys(self.params[i-1])[0] + '=' + self.params[i-1][Object.keys(self.params[i-1])[0]];
                    } else {
                        q += Object.keys(self.params[i-1])[0] + '=' + self.params[i-1][Object.keys(self.params[i-1])[0]] + '&';
                    }
                }
                return q;
            } else {
                return '';
            }
        };
        self.getParam = function(paramName) {

        };
    }

    return function () {
        var self = this;
        self.transactions = ko.observableArray();
        self.offset = ko.observable();
        self.limit = ko.observable();
        self.from = ko.observable();
        self.to = ko.observable();
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);

        self.limit = ko.observable();
        self.offset = ko.observable();
        self.from = ko.observable();
        self.to = ko.observable();

        self.filterBy = ko.observable();
        self.filterValue = ko.observable();
        self.orderBy = ko.observable();
        self.orderDirection = ko.observable();

        self.searchBy = ko.observable();
        self.searchValue = ko.observable();

        self.search = function() {

            var par = new GetParams();
            par.push({limit: self.limit()});
            par.push({offset: self.offset()});

            $.getJSON('/api/admin/payments' + par.get(), function(res) {
                if(res.status === 0) {
                    self.transactions([]);
                    for(var iterator in res.data) {
                        self.transactions.push(new TransactionModel(res.data[iterator]));
                    }
                } else {
                    console.log('Error');
                }
            });
        };
        self.getAllTransactions = function() {
            $.getJSON('/api/admin/payments', function(res) {
                if(res.status === 0) {
                    self.transactions([]);
                    for(var iterator in res.data) {
                        self.transactions.push(new TransactionModel(res.data[iterator]));
                    }
                } else {
                    console.log('Error');
                }
            });
        };
        self.getAllTransactions();
    };
});