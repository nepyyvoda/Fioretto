/**
 * Created by anton.nepyyvoda on 06.08.2015.
 */
define(['jquery', 'knockout', './worker/index'], function($, ko, WorkerModel) {
    return function () {
        var self = this;
        self.workers = ko.observableArray();
        self.isLoading = ko.observable(false);
        self.isError = ko.observable(false);
        self.errorText = ko.observable(false);
        self.getList = function() {
            $.getJSON('/api/workers', function(res) {
                if(res.status === 0) {
                    self.workers.push(new WorkerModel());
                } else {

                }
            });
        }
    }
});