/**
 * Created by vitaliy on 26.06.15.
 */

$(document).ready(function() {
    $.getJSON('/api/user/' + $.cookie('userId') + '/services/browser', function(res) {
        if(res.status === 0) {
            if(res.data.available === 1){
                moment.locale('en');
                console.log(moment(res.data.end_time).endOf('day').fromNow());
                $('.relative-time').removeClass('hidden').text('Relative time : ' + moment(res.data.end_time).endOf('day').fromNow());
            }else{
                $('.has-browser').addClass('hidden');
                $('.no-has-browser').removeClass('hidden');
            }
        }
        //email
    });
});