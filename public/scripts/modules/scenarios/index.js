/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './scenario/index', 'libs/jquery.cookie'], function($, ko, ScenarioModel) {
    return function () {
        var self = this;
        self.scenarios = ko.observableArray();
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);
        self.getList = function() {
            //user id
            self.isLoading(true);
            $.getJSON('/api/scenarios' + $.cookie('userId'), function(res) {
                self.isLoading(false);
                if(res.status === 0) {
                    self.isError(false);
                    for(var iterator in res.scenarios) {
                        self.scenarios.push(new ScenarioModel(res.scenarios[iterator]))
                    }
                } else {
                    self.isError(true);
                    //self.errorText('Network Error');
                }
            });
        }
    };
});