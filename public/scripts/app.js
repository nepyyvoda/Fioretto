/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
'use strict';

function validateURL(textval) {
    var urlregex = new RegExp(
        "^(http|https)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    return urlregex.test(textval);
}
function str_replace ( search, replace, subject ) {
    // Replace all occurrences of the search string with the replacement string
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Gabriel Paderni
    if(!(replace instanceof Array)){
        replace=new Array(replace);
        if(search instanceof Array){//If search is an array and replace is a string, then this replacement string is used for every value of search
            while(search.length>replace.length){
                replace[replace.length]=replace[0];
            }
        }
    }
    if(!(search instanceof Array))search=new Array(search);
    while(search.length>replace.length){//If replace has fewer values than search , then an empty string is used for the rest of replacement values
        replace[replace.length]='';
    }
    if(subject instanceof Array){//If subject is an array, then the search and replace is performed with every entry of subject , and the return value is an array as well.
        for(k in subject){
            subject[k]=str_replace(search,replace,subject[k]);
        }
        return subject;
    }
    for(var k=0; k<search.length; k++){
        var i = subject.indexOf(search[k]);
        while(i>-1){
            subject = subject.replace(search[k], replace[k]);
            i = subject.indexOf(search[k],i);
        }
    }
    return subject;
}

function initScenario(el) {
    var url = $('#scenario-url').val();
    if(validateURL(url)) {
        $.getJSON('/api/scenarios/init?url=' + encodeURIComponent($.trim(url)), function(res) {
            console.log(res);
            if(res.status == 0) {
                window.location = 'scenario/creating?url=' + encodeURIComponent($.trim(url)) + '&proxy=' + encodeURIComponent(res.proxy);
            }
        })
    }
}

function deleteScenario(el) {
    var id = $(el).closest('.list-row-clone').attr('data-id');
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
