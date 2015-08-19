/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './tariff/index', 'libs/waitsync'], function ($, ko, TariffModel, WaitSync) {
    return function () {

        var self = this;
        self.tariffs = ko.observableArray([]);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);
        self.isTariffsLoaded = ko.observable(false);

        self.getTariffs = function () {

            $.getJSON('/api/admin/tariffs', function (res) {
                if (res.status === 0) {
                    for (var iterator in res.data) {
                        self.tariffs.push(new TariffModel(res.data[iterator]))
                    }
                    self.isTariffsLoaded(true);
                } else {
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
                $.ajax({
                    type: 'put',
                    url: '/api/admin/tariffs',
                    contentType: 'application/json',
                    data: JSON.stringify(requestBody),
                    cache: false,
                    success: function (res) {
                    },
                    error: function (res, status, error) {

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