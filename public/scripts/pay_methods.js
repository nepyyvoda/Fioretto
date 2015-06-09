/**
 * Created by vitaliy on 09.06.15.
 */

$(document).ready(function() {
    $('a.paypal').click(function(e){
        var custom = {};
        custom.user = $.cookie("userId");
        if($('input.amount').val() > 0) {
            console.log('DATA : ', $('input.amount').val(), JSON.stringify(custom));
            $('<form method="post" action="https://www.sandbox.paypal.com/cgi-bin/webscr" class="paypal-button" target="_top">' +
            '<div class="hide" id="errorBox"></div>' +
            '<input type="hidden" name="button" value="buynow">' +
            '<input type="hidden" name="item_name" value="Addition">' +
            '<input type="hidden" name="quantity" value="1">' +
            '<input type="hidden" name="amount" value="' + $('input.amount').val() + '">' +
            '<input type="hidden" name="custom" value="' + JSON.stringify(custom) + '">' +
            '<input type="hidden" name="currency_code" value="USD">' +
            '<input type="hidden" name="env" value="www.sandbox">' +
            '<input type="hidden" name="cmd" value="_xclick">' +
            '<input type="hidden" name="business" value="TENPTSTHJ3KVS">' +
            '<input type="hidden" name="bn" value="JavaScriptButton_buynow">' +
            '</form>').submit();
        }
    });
});