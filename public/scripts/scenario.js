/**
 * Created by vitaliy on 08.07.15.
 */
var localDataObj = {};
var scenarios = {};
$(document).ready(function() {
    updateScenariosList();
});

function clickStartScenario(el){
    console.log(el);

    $.getJSON('/api/services/2/price', function(res){
        if(res.status === 0){
            if(res.data.err === 0){
                console.log(res.data);
                var id = $(el).closest('.list-row-clone').attr('data-id');
                for(var i in localDataObj.scenarios){
                    if(localDataObj.scenarios[i].id === +id){
                        $('#modalstartscenario').openModal();
                        $('#price_count').text((res.data.result[localDataObj.scenarios[i].mode].value_price * localDataObj.scenarios[i].countTotal)/100 + "$");
                    }
                }

            } else {
                alert('Have some problem with request')
            }
        }
    });

    $('#start_accept').on('click', function(e){
        console.log('#start_accept click');
        startScenario(el);
        $('#start_accept').off('click');
    });
}

function initScenario(el) {
    var url = $('#scenario-url').val();
    if(validateURL(url)) {
        $.getJSON('/api/scenarios/init?url=' + encodeURIComponent($.trim(url)+'{n}'), function(res) {
            if(res.status == 0) {
                window.location = 'scenario/creating?url=' + encodeURIComponent($.trim(url)) + '&proxy=/scenario-manager/' + $.trim(url);
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
    localDataObj.scenarios = {};

    $.getJSON('/api/scenarios', function(res) {
        $('#scenarios-list').find('.list-row-clone').remove();
        if(Object.keys(res.data).length > 0) {
            $('.empty').addClass('hidden');
            localDataObj.scenarios = res.data;
            for(var i in res.data) {
                console.log(res.data[i]);

                var $template = $(".template");
                var $tmp = null;

                $tmp = $template.clone().removeClass("template").removeClass('hidden').addClass('list-row-clone');
                $tmp.find('.name').text(res.data[i].nameScenario);
                $tmp.find('.url').text(res.data[i].URL_target);
                $tmp.find('.iter').text(res.data[i].countTotal);
                console.log('res.data[i].mode = ',res.data[i].mode);
                $tmp.find('.mode').prop('checked', res.data[i].mode === 1?true:false);

                var statusText = '';
                switch (res.data[i].status) {
                    case 0:
                        statusText = 'inactive';
                        addListener($tmp);
                        break;
                    case 1:
                        statusText = 'processing';
                        break;
                    case 2:
                        statusText = 'performing';
                        break;
                    case 3:
                        statusText = 'done';
                        break;
                    default :
                        statusText = 'inactive';
                        addListener($tmp);
                }

                if(res.data[i].status !== 0) {
                    $tmp.find('.actions').children('.start').hide();
                }
                $tmp.find('.status').text(statusText);
                $tmp.attr('data-id', res.data[i].id);

                if(res.data[i].mode === 1)
                    $tmp.find('.mode').text('Speed');
                //res.data[i].mode;
                //res.data[i].nameScenario;
                $tmp.appendTo('#scenarios-list');
            }
        } else {
            $('#scenarios-list').append(
                '<tr class="list-row-clone empty">'+
                '<td colspan="6">No scenarios to show</td>'+
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
                updateUserInfo();
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

function addListener(jQObject){

    jQObject.find('.name').on('click', function(e){

        var tr = $(e.currentTarget);
        var text_value = tr.text();
        tr.empty();
        tr.append('<div class="input-field col s6"><input placeholder="Name" id="name_scenario" type="text" class="validate" value="' + text_value +'"></div>');
        var input = tr.find(':text').focus();

        input.focusout(function(e){
            var text_value_2 = jQObject.find('#name_scenario').val();
            tr.empty();

            if(text_value_2.length > 0){
                tr.text(text_value_2);
                $.ajax({
                    url: '/api/scenarios',
                    type: "POST",
                    data: {id : jQObject.attr('data-id'), data : {  nameScenario : text_value_2}},
                    success: function(data){
                        console.log('UPDATE RESULT : ', data);
                    }
                });
            } else {
                tr.text(text_value);
            }
        });
    });

    jQObject.find('.iter').on('click', function(e){
        var tr = $(e.currentTarget);
        var text_value = tr.text();
        tr.empty();
        tr.append('<div class="input-field col s6"><input placeholder="Count" id="count_iteration" type="text" length="4" class="validate numbersOnly" value="' + text_value +'"></div>');
        var input = tr.find(':text').focus();

        input.focusout(function(e){
            var text_value_2 = jQObject.find('#count_iteration').val();
            tr.empty();

            if($.isNumeric(text_value_2)){
                tr.text(text_value_2);
                var obj = {};
                obj.id = jQObject.attr('data-id');
                obj.data = {countTotal : text_value_2};
                $.ajax({
                    url: '/api/scenarios/' + jQObject.attr('data-id'),
                    method: 'PUT',
                    data: JSON.stringify(obj),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (res){
                        console.log('response ', res);
                    },
                    error: function() {
                        console.log(arguments)
                    }
                });
            } else {
                tr.text(text_value);
            }
        });
    });
}