/**
 * Created by vitaliy on 29.05.15.
 */

$(document).ready(function() {
    $.getJSON('/api/services/1/price', function(res){
        if(res.status === 0){
            if(res.data.err === 0){
                for(var i in res.data.result){
                    $('#' + res.data.result[i].name).text((res.data.result[i].value_price / 100) + ' $');
                }
            }
        }
    });

    $('.modal-trigger').click(function(e){
        console.log('click! modal ', e);
        $('.buy-link').attr('data-send',e.currentTarget.id);
    });

    $('.modal').on('click', '.buy-link', function(e){

        var reqData = {
            userid: $.cookie('userId'),
            name :  $('.buy-link').attr('data-send').slice(4),
            count : $('#input_count').val() || 0
        };

        $.ajax({
            url: '/api/services/buy',
            method: "POST",
            data: reqData,
            async: false,
            success: function(data){
                console.log('yes!!', data);
                updateUserInfo();
            },
            error: function(){
                console.log('no!!');
            }
        });
    });
});
