/**
 * Created by vitaliy on 08.07.15.
 */

var localDataObj = {};

$(document).ready(function() {
    updateScenariosList();
});

function clickStrartScenario(el){
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
                $tmp.find('.mode').text(res.data[i].mode === 1?'Boosted':'Standard');

                var statusText = '';
                switch (res.data[i].status) {
                    case 0:
                        statusText = 'inactive';
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