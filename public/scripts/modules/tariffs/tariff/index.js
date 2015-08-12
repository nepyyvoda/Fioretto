/**
 * Created by anton.nepyyvoda on 05.08.2015.
 */
define(['jquery', 'knockout'], function ($, ko) {

    return function (data) {
        var self = this;
        self.id = data.id;
        self.serviceId = data.servicesID;
        self.name = data.name;
        self.price = data.price;
        self.active = data.active.data[0];
        self.duration = data.duration;

    };
});