/**
 * Created by anton.nepyyvoda on 06.08.2015.
 */
define(['jquery', 'knockout'], function($, ko) {
    return function () {
        var self = this;
        self.id = ko.observable();
        self.name = ko.observable();
        self.host = ko.observable();
        self.port = ko.observable();
        self.status = ko.observable();
        /*
        * stack - array of scenarios
        * */
        self.stack = ko.observableArray();
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);
        self.update = function(callback) {
            $.ajax({
                type: 'PUT',
                url: '/api/workers/' + self.id(),
                contentType: 'application/json',
                data: JSON.stringify({

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
        self.getInfo = function() {

        }
    };
});