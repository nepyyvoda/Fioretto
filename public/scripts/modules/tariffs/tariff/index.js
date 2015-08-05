/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout'], function($, ko) {
    return function () {
        var self = this;
        self.name = ko.observable();
        self.value = ko.observable();
        self.update = function() {

        }
    };
});