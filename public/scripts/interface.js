/**
 * Created by vitaliy on 26.06.15.
 */

$(document).ready(function() {
    var updatePageData = function (){
        $.getJSON('/api/user/' + $.cookie('userId') + '/services/browser', function(res) {
            if(res.status === 0) {
                if(res.data.available === 1){
                    moment.locale('en');
                    console.log(moment(res.data.end_time).endOf('day').fromNow());
                    $('.has-browser').removeClass('hidden');
                    $('.relative-time').removeClass('hidden').text('Relative time : ' + moment(res.data.end_time).endOf('day').fromNow());
                    $('.no-has-browser').addClass('hidden');
                }else{
                    $('.no-has-browser').removeClass('hidden');
                    $('.has-browser').addClass('hidden');
                    $('.relative-time').addClass('hidden');
                    $.getJSON('/api/services/1/price', function(res){
                        if(res.status === 0){
                            if(res.data.err === 0){
                                for(var i in res.data.result){
                                    $('#' + res.data.result[i].name).text((res.data.result[i].value_price / 100) + ' $');
                                }
                            }
                        }
                    });
                }
            }
            //email
        });
    }

    updatePageData();

    $('.modal-trigger').click(function(e){
        $('#buy_link').attr('data-send',e.currentTarget.id);
        return true;
    }).leanModal({
            complete: function() { buy_options = "" } // Callback for Modal close
        }
    );

    $('#buy_link').click(function(e){
        console.log('click!');

        $.ajax({
           url: '/api/services/buy',
           method: "POST",
           data: {userid: $.cookie('userId'),
               name :  $('#buy_link').attr('data-send').slice(4)
           },
           async: false,
           success: function(data){
               console.log('yes!!', data);
               updatePageData();
               $.getJSON('/api/user/' + $.cookie('userId'), function(res) {
                   if(res.status === 0) {
                       var userDeposit = res.data.balance/100;
                       $('.balance span').text(userDeposit.toFixed(2));
                       $('.profile_name').text(res.data.login);
                       $('#user-email').val(res.data.email);
                   }
                   //email
               });
           },
           error: function(){
               console.log('no!!');
               updatePageData();
           }
       });
    });

});