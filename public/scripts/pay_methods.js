/**
 * Created by vitaliy on 09.06.15.
 */

$(document).ready(function() {
    $('a.paypal').click(function(e){
        if($('input.amount').val() > 0) {
            console.log('DATA', $("input[name='amount']"), $('input.amount').val(), $.cookie("userId"));
            $("input[name='amount']").val($('input.amount').val());
            $("input[name='custom']").val(JSON.stringify({userId: $.cookie("userId")}));
            $("form.paypal-button").submit();
        }
    });
});