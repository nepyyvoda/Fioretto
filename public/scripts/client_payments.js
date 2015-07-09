/**
 * Created by vitaliy on 09.07.15.
 */

var app = angular.module('materializeApp', ['ui.materialize'])
    .controller('PaginationController', ["$scope", function ($scope) {
        $scope.changePage = function (page) {
            updatePayment(page);
        }
    }]);

function updatePayment(offset){
    var limit = 10;

    if(window.location.pathname === "/client_payment"){
        var requestData = {};
        var inputFrom = $('.datepicker').first().pickadate();
        var inputTo = $('.datepicker').last().pickadate();
        var pickerTo = inputTo.pickadate('picker');
        var pickerFrom = inputFrom.pickadate('picker');


        pickerTo.off('close');
        pickerFrom.off('close');

        if($(".picker__day--selected").length !== 2){
            var current = new Date();
            pickerTo.set('select', current);
            pickerFrom.set('select', current.setMonth(current.getMonth() - 1));
        }

        //PREPARE REQUEST
        requestData.from = pickerFrom.get('select').pick;
        requestData.to = pickerTo.get('select').pick;
        if(typeof offset !== "undefined"){
            requestData.offset = (offset * limit) - limit;
        }

        $.getJSON('/api/user/' + $.cookie('userId') + '/payments', requestData,function(res){
            $('#payments-list').find('.list-row-clone').remove();
            $('pagination').attr('total', res.data.count);
            if(Object.keys(res.data.data).length > 0) {
                for(var i in res.data.data) {
                    var $template = $(".template");
                    var $tmp = null;
                    var parsedDate =  new Date(res.data.data[i].end_time);
                    $tmp = $template.clone().removeClass("template").removeClass('hidden').addClass('list-row-clone');
                    $tmp.find('.date').text(parsedDate.toLocaleDateString() + " " +  parsedDate.toLocaleTimeString());
                    $tmp.find('.transactionid').text(res.data.data[i].transactionID);
                    $tmp.find('.serviceid').text(res.data.data[i].serv_name);
                    $tmp.find('.paysystem').text(res.data.data[i].payservice_name);
                    $tmp.find('.sum').text('$' + res.data.data[i].amount/100);

                    $tmp.attr('data-id', res.data.data[i].id);
                    if(res.data.data[i].transactionTypeID === 2)
                        $tmp.addClass("red").addClass("lighten-3");
                    $tmp.appendTo('#payments-list');

                    //DRAW paginator

                }
            } else {
                var $template = $(".empty");
                var $tmp = null;
                $tmp = $template.clone().removeClass("empty").removeClass('hidden').addClass("list-row-clone");
                $tmp.appendTo('#payments-list');
            }
        });

        pickerTo.on('close', function(){updatePayment()});
        pickerFrom.on('close', function(){updatePayment()});
    }
}

$(document).ready(function() {
    updatePayment();
});