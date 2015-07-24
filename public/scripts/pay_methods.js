/**
 * Created by vitaliy on 09.06.15.
 */

$(document).ready(function() {
    $('a.paypal').click(function(e){
        if($('input.amount').val() > 0) {
            $('#refill_paypal').openModal();
            console.log('DATA', $("input[name='amount']"), $('input.amount').val(), $.cookie("userId"));
            $("input[name='amount']").val($('input.amount').val());
            $("input[name='custom']").val(JSON.stringify({userId: $.cookie("userId")}));
            $("form.paypal-button").submit();
        }
    });

    var handler = StripeCheckout.configure({
        key: 'pk_test_Ne3sSG8PZwou0x0vOUf7vJBU',
        image: '/images/MasterCard.png',
        token: function(response) {
            if(typeof response.error === 'undefined'){
                var post_data = {};
                post_data.id = response.id;
                post_data.amount = $('input.amount').val() * 100;
                console.log(post_data);
                $.ajax({
                    url: '/api/payment/mastercard',
                    method: "POST",
                    data: post_data,
                    success: function(data){
                        console.log(data);
                        updateUserInfo();
                    },
                    error: function(){
                        alert('Some problems');
                        console.log('no!!');
                    }
                });
            } else {
                alert('Wrong data card');
            }
        }
    });

    $($('.mastercard')[0]).on('click', function(e) {

        if($('input.amount').val() > 0) {
            handler.open({
                name: 'Charge',
                description: 'Charge balance',
                zipCode: true,
                amount: $('input.amount').val() * 100
            });
            e.preventDefault();
        } else {
            alert('Enter count into field!');
        }
        // Open Checkout with further options
    });

    // Close Checkout on page navigation
    $(window).on('popstate', function() {
        handler.close();
    });
});