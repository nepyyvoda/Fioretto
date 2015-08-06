/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout'], function($, ko) {
    return function () {
        var self = this;
        self.id = ko.observable();
        self.name = ko.observable();
        self.iterations = ko.observable();
        self.script = ko.observable();
        self.url = ko.observable();
        self.mode = ko.observable();
        self.resolution = ko.observable();
        self.status = ko.observable();
        self.save = function() {
            //if id - update else create
        };
        self.remove = function() {

        };
        self.activate = function() {

        };

    };
});