/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './tariff/index.js'], function($, ko, tariff) {
    return function () {
        var self = this;
        self.tariffs = ko.observableArray();
        self.getTariffs = function() {

        }
    };
});