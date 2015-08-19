/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './transaction/index'], function ($, ko, TransactionModel) {
    function GetParams() {
        var self = this;
        self.params = [];
        self.push = function (object) {
            self.params.push(object);
            console.log(self.params);
        };
        self.pop = function () {
            return self.params.pop();
        };
        self.get = function () {
            if (self.params.length >= 0) {
                var q = '?';
                for (var i = 1; i <= self.params.length; i++) {
                    if (i === self.params.length) {
                        q += Object.keys(self.params[i - 1])[0] + '=' + self.params[i - 1][Object.keys(self.params[i - 1])[0]];
                    } else {
                        q += Object.keys(self.params[i - 1])[0] + '=' + self.params[i - 1][Object.keys(self.params[i - 1])[0]] + '&';
                    }
                }
                return q;
            } else {
                return '';
            }
        };
        self.getParam = function (paramName) {

        };
    }

    var ascRegexp = new RegExp('asc', 'gmi');
    var asc = 'ASC';
    var desc = 'DESC';

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
        self.orderArray = ko.observable({});
        self.filterArray = ko.observable({});

        self.createParamString = function () {
            var params = '?';
            self.orderArray() ? params += 'order=' + JSON.stringify(self.orderArray()) + '&' : params;
            self.filterArray() ? params += 'filter=' + JSON.stringify(self.filterArray()) + '&' : params;
            return params;
        };

        self.getOrderPayments = function (column) {
            if (self.isLoading()) {
                if (self.orderArray()[column]) {
                    if (self.orderArray()[column].match(ascRegexp)) {
                        self.orderArray()[column] = desc;
                    } else {
                        delete  self.orderArray()[column];
                    }
                } else {
                    self.orderArray()[column] = 'ASC';
                }
                self.getAllTransactions();
            }

        };

        self.getFilteredPayments = function (column, min, max) {
            if (self.isLoading()) {
                if (self.filterArray()[column]) {
                    var tmp = self.filterArray()[column];
                    tmp.min_value = min;
                    tmp.max_value = max;
                } else {
                    self.filterArray()[column] = {
                        min_value: min,
                        max_value: max
                    };
                }
                console.log(self.filterArray())

                self.getAllTransactions();
            }

        };

        self.deleteFilter = function (column) {
            if (self.isLoading()) {
                delete  self.filterArray()[column];
                self.getAllTransactions();
            }
        };

        self.search = function () {

            var par = new GetParams();
            par.push({limit: self.limit()});
            par.push({offset: self.offset()});

            $.getJSON('/api/admin/payments' + par.get(), function (res) {
                if (res.status === 0) {
                    self.transactions([]);
                    for (var iterator in res.data) {
                        self.transactions.push(new TransactionModel(res.data[iterator]));
                    }
                } else {
                    console.log('Error');
                }
            });
        };

        self.hideErrorMessage = function () {
            self.isError(false);
            self.isError(false);
        };

        self.getAllTransactions = function () {
            self.isLoading(false);
            $.getJSON('/api/admin/payments' + self.createParamString(), function (res) {
                    self.isLoading(true);
                    if (res.status === 0) {
                        self.transactions([]);
                        for (var iterator in res.data) {
                            self.transactions.push(new TransactionModel(res.data[iterator]));
                        }

                    }
                    else {
                        console.log('Error');
                        self.isError(true);
                        self.errorText("Internal server error, try again later. All data on page  will update" + error);
                    }
                }
            )
            ;
        };
        self.getAllTransactions();
    };
})
;