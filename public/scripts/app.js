/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
'use strict';

function createXPathFromElement(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode)
    {
        if (elm.hasAttribute('id')) {
            var uniqueIdCount = 0;
            for (var n=0;n < allNodes.length;n++) {
                if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                if (uniqueIdCount > 1) break;
            }
            if ( uniqueIdCount == 1) {
                segs.unshift('id("' + elm.getAttribute('id') + '")');
                return segs.join('/');
            } else {
                segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
            }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
        } else {
            var sib = null;
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName == elm.localName)  i++; };
            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        }
    }
    return segs.length ? '/' + segs.join('/') : null;
}

function XPath(elm) {
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
            segs.unshift('id("' + elm.getAttribute('id') + '")')
            return segs.join('/')
        }
        else if (elm.hasAttribute('class'))
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]')
        else {
            var sib= null;
            for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling)
                if (sib.localName == elm.localName) i++
            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']')
        }
    }
    return segs.length ? '/' + segs.join('/') : null
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

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
            if(res.status == 0) {
                window.location = 'scenario/creating?url=' + encodeURIComponent($.trim(url)) + '&proxy=/vpn?url=' + $.trim(url);
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
                alert('Request cannot be handled');
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
            $('.empty').addClass('hidden');
            for(var i in res.data) {
                var $template = $(".template");
                var $tmp = null;

                $tmp = $template.clone().removeClass("template").removeClass('hidden').addClass('list-row-clone');
                $tmp.find('.name').text(res.data[i].nameScenario);
                $tmp.find('.url').text(res.data[i].URL_target);
                $tmp.attr('data-id', res.data[i].id);
                //res.data[i].mode;
                //res.data[i].nameScenario;
                $tmp.appendTo('#scenarios-list');
            }
        } else {
            $('#scenarios-list').append(
                '<tr class="list-row-clone empty">'+
                    '<td colspan="5">No scenarios to show</td>'+
                '</tr>'
            );
        }
    });
}

function startScenario(el) {
    var id = $(el).closest('.list-row-clone').attr('data-id');
    $.ajax({
        type: 'POST',
        url: '/api/scenarios/' + id + '/start',
        cache: false,
        success: function(res) {
            if(res.status === 0) {
                alert('started');
            } else {
                alert('Request cannot be handled');
            }
        },
        complete: function() {

        },
        error: function(request, status, error) {
        }
    });
}

function updatePayment(){
    if(window.location.pathname === "/client_payment"){
        var datePickerFromTo = {};
        var inputFrom = $('.datepicker').first().pickadate();
        var inputTo = $('.datepicker').last().pickadate();
        var pickerTo = inputTo.pickadate('picker');
        var pickerFrom = inputFrom.pickadate('picker');

        if($(".picker__day--selected").length !== 2){
            var current = new Date();
            pickerTo.set('select', current);
            pickerFrom.set('select', current.setMonth(current.getMonth() - 1));
        }

        datePickerFromTo.from = pickerFrom.get('select').pick;
        datePickerFromTo.to = pickerTo.get('select').pick;

        $.getJSON('/api/user/' + $.cookie('userId') + '/payments', datePickerFromTo,function(res){
            console.log(res);
            $('#payments-list').find('.list-row-clone').remove();
            if(Object.keys(res.data).length > 0) {
                for(var i in res.data) {
                    console.log(res.data[i]);
                    var $template = $(".template");
                    var $tmp = null;
                    var parsedDate =  new Date(res.data[i].end_time);
                    $tmp = $template.clone().removeClass("template").removeClass('hidden').addClass('list-row-clone');
                    $tmp.find('.date').text(parsedDate.toLocaleDateString() + " " +  parsedDate.toLocaleTimeString());
                    $tmp.find('.transactionid').text(res.data[i].transactionID);
                    $tmp.find('.serviceid').text(res.data[i].serv_name);
                    $tmp.find('.paysystem').text(res.data[i].payservice_name);
                    $tmp.find('.sum').text('$' + res.data[i].amount/100);

                    $tmp.attr('data-id', res.data[i].id);
                    //res.data[i].mode;
                    //res.data[i].nameScenario;
                    if(res.data[i].transactionTypeID === 2)
                        $tmp.addClass("red").addClass("lighten-3");
                    $tmp.appendTo('#payments-list');
                }
            } else {
                var $template = $(".empty");
                var $tmp = null;
                $tmp = $template.clone().removeClass("empty").removeClass('hidden').addClass('list-row-clone');
                $tmp.appendTo('#payments-list');
            }
        });
    }
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
        updatePayment();
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
                } else {
                    alert('Wrong authorization data');
                }
            },
            complete: function() {

            },
            error: function(request, status, error) {
                alert('Network error');
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
                } else {
                    alert('Request cannot be handled');
                }
            },
            complete: function() {
            },
            error: function(request, status, error) {
                alert('Network error');
            }
        });
    });

    var xpath = null;
    var captcha = {};
    //????????? ?????? ?????
    captcha.working = false;
    //????????? ?????? ????? ? ?????? ??????????
    captcha.image = false;
    //????????? ?????? ????? ? ?????? ???? ???????? ?????????????
    captcha.input = false;

    window.eventsChain = [];
    $('#clearChain').on('click', function() {
        $('.qazwsxedcrfvtgb').remove();
        window.eventsChain = [];
    });

    $('#accept-voting').on('click', function() {
        if(eventsChain.length <= 0) {
            alert('Pick element for voting');
            return;
        }
        var iterations = parseInt($('[name="count"]').val(), 10);
        if(isNaN(iterations)) {
            alert('Choose votes amount');
            return;
        }
        var boost = $('#boost').is(':checked');
        var mode = boost?1:0;
        $.ajax({
            type: "POST",
            url: "/api/scenarios",
            data: JSON.stringify({
                count: iterations,
                chain: window.eventsChain,
                url: decodeURIComponent(getParameterByName('url')),
                name: $('[name="name"]').val(),
                proxy: getParameterByName('proxy'),
                mode: mode,
                resolution: {
                    w: window.screen.availWidth,
                    h: window.screen.availHeight
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                if(data.status == 0) {
                    alert('Created');
                    window.location = '/scenaries';
                } else {
                    alert('Request cannot be handled');
                }
            },
            error: function(errMsg) {
                alert('Network error');
            }
        });
    });

    $('iframe').on('load', function(e) {
        $('iframe').contents().find('body').on('contextmenu click dblclick keypress', function(e) {
            xpath = XPath(e.target);
            console.log("EVENT : ",e);

            //?????? ???????: ?????????? ????? ?????? ?????????? ?????
            if (captcha.working){

                var element = $(e.target);
                console.log("Coordinates : ", element.offset());
                console.log("Size : ", element.height(), element.width());
                console.log("TAG : ", element[0].tagName);

                if(captcha.image){
                    //Block bubbling event
                    e.preventDefault();
                    e.stopPropagation();

                    if(element[0].tagName === 'IMG'){
                        eventsChain.push({
                            element: xpath,
                            captcha: {type: 'img', position: element.offset(), size: {w: element.width(), h:element.height()}}
                        });

                        captcha.image = false;
                        $('#captchaImage').trigger('statusChange', ['hasImg']);
                    } else {
                        alert('Sorry, but this is not image... Try again');
                        return;
                    }

                }

                if(captcha.input){

                    if(element[0].tagName === 'INPUT'){
                        eventsChain.push({
                            element: xpath,
                            captcha: {type: 'input'}
                        });

                        captcha.input = false;
                        $('#captchaInput').addClass('disabled');
                        $('#captchaInputStatus').addClass('hide');
                        //???????? ????, ??? ???????? ?????? ?????? ? ??????
                        captcha.working = false;
                        $('#captchaActivate').trigger('click');

                    } else {
                        alert('Sorry, but this is not input... Try again');
                        return;
                    }
                }
            } else {
                eventsChain.push({
                    element: xpath,
                    action: e.type
                });
            }

            $('body').append('<div class="qazwsxedcrfvtgb" style="position: absolute; border:1px solid black; left: ' + e.clientX + 'px; top: ' + parseInt(e.clientY + 165, 10) + 'px;">' + eventsChain.length + '</div>');
        });
    });

    //???? ???????????? ???????? ?????? ? ??????
    $('#captchaActivate').on('click', function(e){

        //????????? ?? ?????????? ?????? ?????? ?????
        if($(this).hasClass('active')){

            //??????? ????? ????????, ????, ??? ?????
            if(captcha.working){
                if (confirm('Are u really want abort build captcha scenario?') === true){
                    console.log('Abort!');
                    //Remove last CAPTCHA element from scenario
                    if (eventsChain.length !== 0 && eventsChain[eventsChain.length - 1].captcha !== undefined && captcha.image){
                        eventsChain.pop();
                        console.log('Remove CAPTCHA object');
                    } else {
                        console.log('Error : Not Remove CAPTCHA object');
                    }
                    captcha.image = false;
                    captcha.input = false;
                    captcha.working = false;
                    $('#captchaActivate').trigger('click');
                }else{
                    console.log('Continuous work');
                    return;
                }

            } else {
                $(this).removeClass('active');
                //????????? ????????? ??????: ?????? ?????????? ?? ???? ??? ????????
                $('#captchaImage').trigger('statusChange', ['disable']);
                console.log("DISABLED");
            }

        } else {
            $(this).addClass('active');
            //???????? ????????? ?????? ?????? ??????????
            $('#captchaImage').trigger('statusChange', ['enable']);
            console.log("ENABLE");
        }
    });

    $('#captchaImage').on('click', function(e){
        //?????? ????? ??????. ??? ????????? ? ??? ?????? ?????? ?? ?????? - ???? ???????? ???????????? ??? ?????
        $('#captchaImageStatus').removeClass('hide').text('Select image!');
        captcha.working = true;
        captcha.image = true;
    });

    //?????????. ?????? ??????????/?????????????? "???????" ????????
    $('#captchaImage').on('statusChange', function(event, state){
        console.log("HERE!", state);
        switch (state){
            case 'disable':
                console.log("CaptchaImage : status disable");
                $('#captchaImage').addClass('disabled');
                $('#captchaImageStatus').addClass('hide');
                $('#captchaInput').addClass('disabled');
                $('#captchaInputStatus').addClass('hide');
                break;
            case 'enable':
                console.log("CaptchaImage : status enable");
                $('#captchaImage').removeClass('disabled');
                break;
            case 'hasImg':
                console.log("CaptchaImage : status hasImg");
                $('#captchaImageStatus').removeClass('hide').text('Image is selected!');
                $('#captchaImageStatus').css('color', 'green');
                $('#captchaImage').addClass('disabled');
                $('#captchaInput').removeClass('disabled');
                break;
            default:
                break;
        }
    });

    $('#captchaInput').on('click', function(e){
        //?????? ????? ??????. ??? ????????? ? ??? ?????? ?????? ?? ?????? - ???? ???????? ???????????? ??? ?????
        $('#captchaInputStatus').removeClass('hide').text('Select input!');
        captcha.input = true;
    });

});

function test()
{
    var requestData = {
        id: $.cookie('userId'),
        email: $('#user-email').val(),
        password: $('#password').val(),
        password_new: $('#password-new').val()
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
                    alert('Updated');
                } else {
                    alert('Request cannot be handled');
                }
            },
            complete: function() {

            },
            error: function(request, status, error) {
                alert('Network error');
            }
        })
}
