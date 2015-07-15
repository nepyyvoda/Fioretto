/**
 * Created by vitaliy on 09.07.15.
 */


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
            console.log(res.data.count);
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

function pagination(el, countEls, countPerPage, callback){
    var summaryPages = Math.ceil(countEls/countPerPage);
    el.find('.li-temp-clone').remove();

    if(summaryPages <= 1){
        return;
    }

    //Builder

    for(var i = 1; i <= summaryPages; i++){
        var $temp = $('.li-temp');
        var $tmp = null;

        $tmp = $temp.clone().removeClass('li-temp').removeClass('hidden').addClass('li-temp-clone');
        $tmp.find('a').text(i);

        if(i === 1){
            var $tempRow = $('.li-temp-before');
            var $tmpRow = $tempRow.clone().removeClass('li-temp-before').removeClass('hidden').addClass('li-temp-clone');
            $tmpRow.appendTo(el);
            $tmp.removeClass('waves-effect').addClass('active').addClass('li-temp-clone');
        }

        $tmp.appendTo(el);

        if(i === summaryPages){
            var $tempRow = $('.li-temp-after');
            var $tmpRow = $tempRow.clone().removeClass('li-temp-before').removeClass('hidden').addClass('li-temp-clone');
            $tmpRow.appendTo(el);
        }
    }

    el.off('click');
    el.on('click', function(e){
        //console.log($(e.target).prop('tagName'));
        switch($(e.target).prop('tagName')){
            case 'LI':
            case 'A':
                console.log('A');
                break;
            case 'I':
                console.log('icon');
                designer($(e.target), 'NEXT');
                break;
            default:
                console.log('NOPE');
        }
    });

    var designer = function(el, command){
        if(command === 'NEXT' || command === 'PREV'){
            if(!$(el).closest('il').hasClass('disabled')){
                console.log($(el).closest('ul').find('.active a').text());
            }else
                return;

        }
    }
}

$(document).ready(function() {
    updatePayment();
});