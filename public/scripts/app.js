/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
'use strict';
$(document).ready(function() {
    console.log('inited');
    $('#register').submit(function(event) {
        event.preventDefault();
        var $form = $(event.currentTarget);
        var requestData = {
            login: '',
            email: '',
            password: ''
        };
        $form.find('input[name]').each(function(index, value) {
            requestData[$(value).attr('name')] = $(value).val();
        });
        requestData.password = (CryptoJS.SHA256(requestData.password)).toString();
        requestData.password_confirm = (CryptoJS.SHA256(requestData.password_confirm)).toString();
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            cache: false,
            beforeSend: function (request) {

            },
            success: function(res) {
                if(res.status === 0) {
                    window.location.pathname = '/login';
                }
            },
            complete: function() {

            },
            error: function(request, status, error) {

            }
        });
    })
});