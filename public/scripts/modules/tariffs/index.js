/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './tariff/index', 'libs/waitsync'], function ($, ko, TariffModel, WaitSync) {
    return function () {

        var self = this;
        self.tariffs = ko.observableArray([]);
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);
        self.isTariffsLoaded = ko.observable(false);

        self.getTariffs = function () {

            self.isLoading(true);

            $.getJSON('/api/admin/tariffs', function (res) {
                self.isLoading(false);
                if (res.status === 0) {
                    for (var iterator in res.data) {
                        self.tariffs.push(new TariffModel(res.data[iterator]))
                    }
                    self.isTariffsLoaded(true);
                } else {
                    self.isLoading(false);
                    self.isError(true);
                    self.errorText("Internal server error, try again later");
                }
            });
        };

        self.updateValue = function (id, value, name) {

            var requestBody = {
                id: id,
                data: {}
            };
            requestBody.data[name] = value;
            self.update(requestBody);
        };

        self.updateActiveStatus = function (id, value) {

            var requestBody = {
                id: id,
                data: {}
            };
            requestBody.data.active = value === true ? 1 : 0;
            self.update(requestBody);

        };

        self.hideErrorMessage = function () {
            self.isError(false);
            self.isError(false);
        };

        self.update = function (requestBody) {

            if (self.isTariffsLoaded()) {
                self.isLoading(true);
                $.ajax({
                    type: 'put',
                    url: '/api/admin/tariffs',
                    contentType: 'application/json',
                    data: JSON.stringify(requestBody),
                    cache: false,
                    success: function (res) {
                        self.isLoading(false);
                    },
                    error: function (res, status, error) {

                        self.isLoading(false);
                        self.isError(true);
                        self.errorText("Internal server error, try again later. All data on page  will update" + error);
                        self.getTariffs();
                    }
                })
            }
        };

        self.getTariffs();
    };
});