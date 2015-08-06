/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './tariff/index.js', 'libs/waitsync'], function($, ko, TariffModel, WaitSync) {
    return function () {
        var self = this;
        self.tariffs = ko.observableArray([]);
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);
        self.getTariffs = function() {
            self.isLoading(true);
            $.getJSON('/api/tariffs', function(res) {
                self.isLoading(false);
                if(res.status === 0) {
                    for(var iterator in res.tariffs) {
                        self.tariffs.push(new TariffModel(res.tariffs()[iterator]))
                    }
                } else {
                    self.isError(true);
                }
            });
        };
        self.update = function() {
            self.isLoading(true);
            var SyncUpdate = new WaitSync(
                function (res) {
                    self.isLoading(false);
                    //res.data[]
                    //check errors
                });
            for(var iterator in self.tariffs()) {
                self.tariffs()[iterator].update(SyncUpdate.wrap(function() {
                    return res;
                }));
            }
        }
    };
});