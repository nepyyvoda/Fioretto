/**
 * Created by vitaliy on 26.06.15.
 */

$(document).ready(function() {
    var updatePageData = function (){
        $.getJSON('/api/user/' + $.cookie('userId') + '/services/1', function(res) {
            if(res.status === 0) {
                if(res.data.available === 1){
                    moment.locale('en');
                    console.log(moment(res.data.end_time).endOf('day').fromNow());
                    $('.has-browser').removeClass('hidden');
                    $('.relative-time').removeClass('hidden').text('Relative time : ' + moment(res.data.end_time).endOf('day').fromNow());
                }else{
                    $('.no-has-browser').removeClass('hidden');
                }
            }
            //email
        });
    }

    updatePageData();
});