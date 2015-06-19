/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
'use strict';
$(document).ready(function() {
    if($.cookie('userId')) {
        $.getJSON('/api/user/' + $.cookie('userId'), function(res) {
            if(res.status === 0) {
                var userDeposit = res.data.balance/100;
                $('.balance span').text(userDeposit.toFixed(2));
                $('.profile_name').text(res.data.login);
                $('#eml').val(res.data.email);
                $('#phone').val(res.data.phone);
                $('#skype').val(res.data.skype);
            }
            //email
        });
    }
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
                    $.cookie('userId', res.data.id);
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

function test()
{
    var requestData = {
        id: $.cookie('userId'),
        email: $('#eml').val(),
        password: $('#password').val(),
        password_new: $('#password-new').val(),
        phone: $('#phone').val(),
        skype: $('#skype').val()
    };

    requestData.password = (CryptoJS.SHA256(requestData.password)).toString();
    requestData.password_new = (CryptoJS.SHA256(requestData.password_new)).toString();

     $.ajax({
            type: 'put',
            url: '/api/users/'+ $.cookie('userId'),
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            cache: false,
            beforeSend: function (request){
                         },
            success: function(res) {
                        if(res.status === 0){
                          alert('Data changed successfully');
                        }
                        },
            complete: function() {  },
            error: function(request, status, error) {  }
        })
}