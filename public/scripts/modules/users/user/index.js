/**
 * Created by anton.nepyyvoda on 29.07.2015.
 */
"use strict";
define(['jquery', 'knockout', 'libs/jquery.cookie', 'libs/sha256'], function($, ko, cookie, CryptoJS) {
    return function () {
        var self = this;
        self.id = ko.observable();
        self.balance = ko.observable();
        self.email = ko.observable();
        self.login = ko.observable();
        self.password = ko.observable();
        self.passwordNew = ko.observable();
        self.passwordNewConfirm = ko.observable();
        self.isLoading = ko.observable(false);
        self.passwordHash = ko.computed(function() {
            return (CryptoJS.SHA256(self.password())).toString();
        });
        self.passwordNewHash = ko.computed(function() {
            return (CryptoJS.SHA256(self.passwordNew())).toString();
        });
        self.update = function(data, event) {
            event.preventDefault();
            if(self.passwordNew() !== self.passwordNewConfirm()) {
                //todo show error
            } else {
                $.ajax({
                    type: 'post',
                    url: 'api/user/'+ self.userId(),
                    contentType: 'application/json',
                    data: JSON.stringify({
                        id: self.id(),
                        password: self.passwordHash(),
                        password_new: self.passwordNewHash()
                    }),
                    cache: false,
                    success: function(res) {
                        alert(res.message);
                    },
                    error: function(res, status, error) {
                        alert('Network error');
                    }
                })
            }
            return false;
        };
        self.logIn = function() {
            $.ajax({
                type: 'POST',
                url: '/api/login',
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify({
                    login: self.email(),
                    password: self.passwordHash()
                }),
                cache: false,
                beforeSend: function (request) {

                },
                success: function(res) {
                    if(res.status === 0) {
                        $.cookie('userId', res.data.id);
                        window.location.pathname = '/profile';
                    } else {
                        alert('Wrong authorization data');
                    }
                },
                complete: function() {

                },
                error: function(request, status, error) {
                    alert('Network error');
                }
            });
            return false;
        }
    };
});