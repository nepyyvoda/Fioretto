/**
 * Created by vitaliy on 26.06.15.
 */

$(document).ready(function() {
    $.getJSON('/api/user/' + $.cookie('userId') + '/services', function(res) {
        if(res.status === 0) {

        }
        //email
    });
});