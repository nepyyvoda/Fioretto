/**
 * Created by vitaliy on 29.05.15.
 */

$(document).ready(function() {
        $('#b_call_pay').click(function(e){

            var amount = $('#i_amount').val();
            console.log(amount);
            if(amount === ''||amount <=0)
                amount=0;
            console.log('DATA', $("input[name='amount']"), amount, $.cookie("userId"));
            $("input[name='amount']").val(amount);
            $("input[name='custom']").val(JSON.stringify({userId: $.cookie("userId")}));
            $('#p_amount').html('Amount is = ' + amount);

        });
});
