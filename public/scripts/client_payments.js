/**
 * Created by vitaliy on 09.07.15.
 */

//var pagActivation = true;
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
        requestData.to = pickerTo.get('select').pick + 86399999;
        if(typeof offset !== "undefined"){
            requestData.offset = (offset * limit) - limit;
        }

        console.log('REQDATA : ', requestData);

        $.getJSON('/api/user/' + $.cookie('userId') + '/payments', requestData,function(res){
            $('#payments-list').find('.list-row-clone').remove();

            console.log(res.data.count);
            if(Object.keys(res.data.data).length > 0) {
                for(var i in res.data.data) {
                    var $template = $(".template");
                    var $tmp = null;
                    var parsedDate =  new Date(res.data.data[i].end_time);
                    $tmp = $template.clone().removeClass("template").removeClass('hidden').addClass('list-row-clone');
                    $tmp.find('.date').text(parsedDate.toLocaleDateString() + " " +  parsedDate.toLocaleTimeString());
                    var trID = res.data.data[i].transactionID;

                    if(trID === null || trID === "0")
                        trID = '--';

                    $tmp.find('.transactionid').text(trID);
                    $tmp.find('.serviceid').text(res.data.data[i].serv_name);
                    $tmp.find('.paysystem').text(res.data.data[i].payservice_name);
                    $tmp.find('.sum').text('$' + res.data.data[i].amount/100);

                    $tmp.attr('data-id', res.data.data[i].id);
                    if(res.data.data[i].transactionTypeID === 2)
                        $tmp.addClass("red").addClass("lighten-3");
                    $tmp.appendTo('#payments-list');

                    //DRAW paginator

                }

                if(typeof offset === "undefined"){
                    $($('.pagination')[0]).empty();
                    pagination($('.pagination')[0], res.data.count, 10);
                }
            } else {
                var $template = $(".empty");
                var $tmp = null;
                $tmp = $template.clone().removeClass("empty").removeClass('hidden').addClass("list-row-clone");
                $tmp.appendTo('#payments-list');
                $($('.pagination')[0]).empty();
            }
        });

        pickerTo.on('close', function(){ updatePayment()});
        pickerFrom.on('close', function(){ updatePayment()});
    }
}

function pagination(el, countEls, countPerPage){
    /*    <li class="disabled li-temp-before hidden"><a href="#!"><i class="material-icons">chevron_left</i></a></li>
     <li class="waves-effect li-temp hidden"><a href="#!"></a></li>
     <li class="waves-effect li-temp-after hidden"><a href="#!"><i class="material-icons">chevron_right</i></a></li>*/

    var summaryPages = Math.ceil(countEls/countPerPage);

    if(summaryPages <= 1){
        return;
    }

    //Builder
    $(el).attr('count', summaryPages);
    $(el).append('<li class="disabled"><a href="#!"><i class="material-icons prev"></i></a></li>');

    for(var i = 1; i <= summaryPages; i++){
        var $temp = '<li class="waves-effect"><a href="#' + i + '">' + i + '</a></li>';
        $temp = $($temp);

        if(i === 1){
            $temp.removeClass('waves-effect').addClass('active');
            console.log($($temp));
        }

        $(el).append($temp);
    }

    $(el).append('<li class="waves-effect"><a href="#!"><i class="material-icons after"></i></a></li>');

    $(el).off('click');
    $(el).on('click', function(e){
        //console.log($(e.target).prop('tagName'));
        switch($(e.target).prop('tagName')){
            case 'LI':
            case 'A':
                designer($(e.target), 'PAGE');
                console.log('A');
                break;
            case 'I':
                console.log('icon');
                var command = $(e.target).hasClass('prev')?'PREV':'NEXT';
                designer($(e.target), command);
                break;
            default:
                console.log('NOPE');
        }
    });

    var designer = function(el, command){
        var numberCurrent = +($(el).closest('ul').find('.active a').text());
        var totalNumber = +($(el).closest('ul').attr('count'));

        if(command === 'NEXT' || command === 'PREV'){
            if(!$(el).closest('li').hasClass('disabled')){
                if(numberCurrent > 1 || numberCurrent < totalNumber){
                    switch (command){
                        case 'NEXT':
                            ($(el).closest('ul').find('a[href="#' + (numberCurrent + 1) + '"]')).click();
                            break;
                        case 'PREV':
                            ($(el).closest('ul').find('a[href="#' + (numberCurrent - 1) + '"]')).click();
                            break;
                    }
                } else {
                    console.log('Last or first page');
                }
            }
        } else if (command === 'PAGE'){
            //Get neede element <a>
            var nextTarget = $(el).closest('li').find('a');
            //Deactivate previous
            $(el).closest('ul').find('.active a').closest('li').removeClass('active').addClass('waves-effect');
            //Activate current
            $(nextTarget).closest('li').removeClass('waves-effect').addClass('active');

            var current = +($(nextTarget)).text();

            if(current !== 1 && current !== totalNumber){
                $($(el).closest('ul').find('i')[0]).closest('li').removeClass('disabled').addClass('waves-effect');
                $($(el).closest('ul').find('i')[1]).closest('li').removeClass('disabled').addClass('waves-effect');
            } else if(current === 1){
                $($(el).closest('ul').find('i')[0]).closest('li').removeClass('waves-effect').addClass('disabled');
                $($(el).closest('ul').find('i')[1]).closest('li').removeClass('disabled').addClass('waves-effect');
            } else if (current === totalNumber){
                $($(el).closest('ul').find('i')[1]).closest('li').removeClass('waves-effect').addClass('disabled');
                $($(el).closest('ul').find('i')[0]).closest('li').removeClass('disabled').addClass('waves-effect');
            }
            pagActivation = false;
            updatePayment(current);
        }
    }
}

$(document).ready(function() {
    updatePayment();
});