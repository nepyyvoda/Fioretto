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

        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable();
        self.save = function(callback) {
            var url = '/api/scenarios/create';
            var method = 'POST';
            if(self.id()) {
                url = '/api/scenarios/' + self.id();
                method = 'PUT';
            }
            $.ajax({
                type: method,
                url: url,
                contentType: 'application/json',
                data: JSON.stringify({
                    name: self.name(),
                    iterations: self.iterations(),
                    script: self.script(),
                    url: self.url(),
                    mode: self.mode(),
                    resolution: self.resolution(),
                    status: self.status()
                }),
                dataType: 'json',
                cache: false,
                beforeSend: function() {
                    self.isLoading(true);
                },
                complete: function() {
                    self.isLoading(false);
                },
                success: function (res) {
                    if(res.status === 0) {
                        if(callback) {
                            callback(false);
                        } else {
                            self.isError(false);
                        }
                    } else {
                        if(callback) {
                            callback(true);
                        } else {
                            self.isError(true);
                            //self.errorText('Internal Error');
                        }
                    }
                },
                error: function (res, status, error) {
                    if(callback) {
                        callback(true);
                    } else {
                        self.isError(true);
                        //self.errorText('Network Error');
                    }
                }
            });
        };
        self.remove = function() {

        };
        self.activate = function() {

        };

    };
});