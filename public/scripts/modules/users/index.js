/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './user/index'], function($, ko, UsrModel) {
    return function () {
        var self = this;
        self.users = ko.observableArray([]);
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);
        self.getUsers = function() {
            //get all users
        };
        self.blockUser = function() {

        };
        self.unblockUser = function() {

        };
        self.deleteUser = function() {

        };
        self.sendEmail = function() {

        };
        self.search = function() {

        }
    };
});