/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
'use strict';
$(document).ready(function() {
    $('#login').submit(function(event) {
        event.preventDefault();
        var $form = $(event.currentTarget);
        var requestData = {
            login: '',
            password: ''
        };
        $form.find('input[name]').each(function(index, value) {
            requestData[$(value).attr('name')] = $(value).val();
        });
        requestData.password = (CryptoJS.SHA256(requestData.password)).toString();
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
                    window.location.pathname = '/profile';
                }
            },
            complete: function() {

            },
            error: function(request, status, error) {

            }
        });
    });
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
                    alert('We have send email with confirmation lint to you email. Please check your email box and verify your account');
                }
            },
            complete: function() {

            },
            error: function(request, status, error) {

            }
        });
    })
});