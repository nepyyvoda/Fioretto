/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
'use strict';

function deleteScenario(el) {
    var id = $(el).closest('.list-row-clone').attr('data-id');
    console.log(id);
    $.ajax({
        type: 'DELETE',
        url: '/api/scenarios/' + id,
        cache: false,
        success: function(res) {
            if(res.status === 0) {
                alert('deleted');
                updateScenariosList();
            } else {
                alert('Error occurred');
            }
        },
        complete: function() {

        },
        error: function(request, status, error) {
        }
    });
}
function updateScenariosList() {
    $.getJSON('/api/scenarios', function(res) {
        $('#scenarios-list').find('.list-row-clone').remove();
        if(Object.keys(res.data).length > 0) {
            for(var i in res.data) {
                console.log(res.data[i]);
                var $template = $(".template");
                var $tmp = null;

                $tmp = $template.clone().removeClass("template").removeClass('hidden').addClass('list-row-clone');
                $tmp.find('.name').text(res.data[i].URL_target);
                $tmp.attr('data-id', res.data[i].id);
                //res.data[i].mode;
                //res.data[i].nameScenario;
            }
            $tmp.appendTo('#scenarios-list');
        }
    });
}

function updatePayment(){
    $.getJSON('/api/user/payments/' + $.cookie('userId'), function(res){
        console.log(res);
        $('#payments-list').find('.list-row-clone').remove();
        if(Object.keys(res.data).length > 0) {
            for(var i in res.data) {
                console.log(res.data[i]);
                var $template = $(".template");
                var $tmp = null;

                $tmp = $template.clone().removeClass("template").removeClass('hidden').addClass('list-row-clone');
                $tmp.find('.login').text(res.data[i].id);
                $tmp.find('.date').text(res.data[i].end_time);
                $tmp.find('.transactionid').text(res.data[i].transactionID);
                $tmp.find('.serviceid').text(res.data[i].servicesID);
                $tmp.find('.scheme').text(res.data[i].paymentSchemeID);
                $tmp.find('.sum').text('$' + res.data[i].amount/100);

                $tmp.attr('data-id', res.data[i].id);
                //res.data[i].mode;
                //res.data[i].nameScenario;
                $tmp.appendTo('#payments-list');
            }

        }
    });
}

$(document).ready(function() {
    if($.cookie('userId')) {
        $.getJSON('/api/user/' + $.cookie('userId'), function(res) {
            if(res.status === 0) {
                var userDeposit = res.data.balance/100;
                $('.balance span').text(userDeposit.toFixed(2));
                $('.profile_name').text(res.data.login);
                $('#user-email').val(res.data.email);
            }
            //email
        });
        updateScenariosList();
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

                        }
                        },
            complete: function() {  },
            error: function(request, status, error) {  }
        })
}
