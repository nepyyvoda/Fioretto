/**
 * Created by anton.nepyyvoda on 29.07.2015.
 */
"use strict";
require([
    'jquery',
    'knockout',
    'require',
    'libs/bootstrap.min',
    'libs/page'
], function ($, ko, require, bootstrap, page) {
    function activateViewModel(context, model) {
        if(Array.isArray(context)) {
            for(var iterator in context) {
                try {
                    if(context[iterator]) {
                        ko.applyBindings(model, context[iterator]);
                    }
                } catch (err) {
                    console.log('Model rendering failed', err);
                }
            }
        } else {
            try {
                ko.applyBindings(model, context);
            } catch (err) {
                console.log('Model rendering failed', err);
            }
        }
    }
    page('/login', function() {
        require(['modules/users/user/index'], function(UserModel) {
            try {
                ko.applyBindings(new UserModel(), $('#login')[0]);
            } catch(e) {
                console.log('err');
            }
        });
        //require(['modules/user/index'], function(UserModel) {
        //    console.log('user model')
        //    var CurrentUser = new UserModel();
        //    //activateViewModel([$('#login')[0], $('#profile-form')[0]], CurrentUser);
        //});
    });
    page('/admin/payments', function() {
        require(['modules/transactions/index'], function(TransactionsModel) {
            try {
                ko.applyBindings(new TransactionsModel(), $('#admin-payments')[0]);
            } catch(e) {
                console.log('err', e);
            }
        });
    });
    page('/admin/tariffs', function() {
        require(['modules/tariffs/index'], function(TariffsModel) {
            try {
                ko.applyBindings(new TariffsModel(), $('#admin-tariffs')[0]);

            } catch(e) {
                console.log(e);
            }
        });
    });
    page.start();
    //page('/user/:user', show)
    //page('/user/:user/edit', edit)
    //page('/user/:user/album', album)
    //page('/user/:user/album/sort', sort)
    page('*', function() {
        //common logic here
    });
});