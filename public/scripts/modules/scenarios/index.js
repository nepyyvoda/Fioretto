/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout', './scenario/index'], function($, ko, ScenarioModel) {
    return function () {
        var self = this;
        self.scenarios = ko.observableArray();
        self.getList = function() {

        }
    };
});