/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout'], function($, ko) {
    return function () {
        var self = this;
        self.id = ko.observable();
        self.name = ko.observable();
        self.value = ko.observable();
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable();
        self.update = function(callback) {
            $.ajax({
                type: 'PUT',
                url: '/api/tariffs/' + self.id(),
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
        }
    };
});