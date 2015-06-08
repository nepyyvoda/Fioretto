/**
 * Created by anton.nepyyvoda on 12.12.2014.
 */
function createXPathFromElement(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode)
    {
        if (elm.hasAttribute('id')) {
            var uniqueIdCount = 0;
            for (var n=0;n < allNodes.length;n++) {
                if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                if (uniqueIdCount > 1) break;
            }
            if ( uniqueIdCount == 1) {
                segs.unshift('id("' + elm.getAttribute('id') + '")');
                return segs.join('/');
            } else {
                segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
            }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
        } else {
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName == elm.localName)  i++; };
            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        }
    }
    return segs.length ? '/' + segs.join('/') : null;
}

function XPath(elm) {
    for (segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
            segs.unshift('id("' + elm.getAttribute('id') + '")')
            return segs.join('/')
        }
        else if (elm.hasAttribute('class'))
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]')
        else {
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling)
                if (sib.localName == elm.localName) i++
            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']')
        }
    }
    return segs.length ? '/' + segs.join('/') : null
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function() {
    var xpath = null;
    var captcha = {};
    //Прапорець роботи капчі
    captcha.working = false;
    //Прапорець роботи капчі і вибору зображення
    captcha.image = false;
    //Прапорець роботи капчі і вибору поля введення розшифрування
    captcha.input = false;

    window.eventsChain = [];
    $('#clearChain').on('click', function() {
        $('.qazwsxedcrfvtgb').remove();
        window.eventsChain = [];
    });

    $('#accept-voting').on('click', function() {
        if(eventsChain.length <= 0) {
            alert('Pick element for voting');
            return;
        }
        if(isNaN(parseInt($('[name="count"]').val(), 10))) {
            alert('Choose votes amount');
            return;
        }
        $.ajax({
            type: "POST",
            url: "/voting",
            data: JSON.stringify({
                count: $('[name="count"]').val(),
                chain: window.eventsChain,
                url: decodeURIComponent(getParameterByName('url')),
                name: $('[name="name"]').val(),
                proxy: getParameterByName('proxy'),
                mode: '',
                resolution: {
                    w: window.screen.availWidth,
                    h: window.screen.availHeight
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                if(data.status == 0) {

                    window.location = '/';
                }
            },
            failure: function(errMsg) {

            }
        });
    });

    $('iframe').on('load', function(e) {
        $('iframe').contents().find('body').on('contextmenu click dblclick keypress', function(e) {
            xpath = XPath(e.target);
            console.log("EVENT : ",e);

            //Розбір польоту: увімкненно режим вибору зображення капчі
            if (captcha.working){

                var element = $(e.target);
                console.log("Coordinates : ", element.offset());
                console.log("Size : ", element.height(), element.width());
                console.log("TAG : ", element[0].tagName);

                if(captcha.image){
                    //Block bubbling event
                    e.preventDefault();
                    e.stopPropagation();

                    if(element[0].tagName === 'IMG'){
                        eventsChain.push({
                            element: xpath,
                            captcha: {type: 'img', position: element.offset(), size: {w: element.width(), h:element.height()}}
                        });

                        captcha.image = false;
                        $('#captchaImage').trigger('statusChange', ['hasImg']);
                    } else {
                        alert('Sorry, but this is not image... Try again');
                        return;
                    }

                }

                if(captcha.input){

                    if(element[0].tagName === 'INPUT'){
                        eventsChain.push({
                            element: xpath,
                            captcha: {type: 'input'}
                        });

                        captcha.input = false;
                        $('#captchaInput').addClass('disabled');
                        $('#captchaInputStatus').addClass('hide');
                        //Імітуємо клік, щоб вимкнути кнопку роботи з капчею
                        captcha.working = false;
                        $('#captchaActivate').trigger('click');

                    } else {
                        alert('Sorry, but this is not input... Try again');
                        return;
                    }
                }
            } else {
                eventsChain.push({
                    element: xpath,
                    action: e.type
                });
            }

            $('body').append('<div class="qazwsxedcrfvtgb" style="position: absolute; border:1px solid black; left: ' + e.clientX + 'px; top: ' + parseInt(e.clientY + 130, 10) + 'px;">' + eventsChain.length + '</div>');
        });
    });

    //Блок відображення операцій роботи з капчею
    $('#captchaActivate').on('click', function(e){

        //Перевірка на активність кнопки вибору капчі
        if($(this).hasClass('active')){

            //Обробка капчі вимкнена, отже, все добре
            if(captcha.working){
                if (confirm('Are u really want abort build captcha scenario?') === true){
                    console.log('Abort!');
                    //Remove last CAPTCHA element from scenario
                    if (eventsChain.length !== 0 && eventsChain[eventsChain.length - 1].captcha !== undefined && captcha.image){
                        eventsChain.pop();
                        console.log('Remove CAPTCHA object');
                    } else {
                        console.log('Error : Not Remove CAPTCHA object');
                    }
                    captcha.image = false;
                    captcha.input = false;
                    captcha.working = false;
                    $('#captchaActivate').trigger('click');
                }else{
                    console.log('Continuous work');
                    return;
                }

            } else {
                $(this).removeClass('active');
                //Вимикаємо допоміжні кнопки: вибору зображення та поля для введення
                $('#captchaImage').trigger('statusChange', ['disable']);
                console.log("DISABLED");
            }

        } else {
            $(this).addClass('active');
            //Вмикаємо допоміжну кнопку вибору зображення
            $('#captchaImage').trigger('statusChange', ['enable']);
            console.log("ENABLE");
        }
    });

    $('#captchaImage').on('click', function(e){
        //Пишемо збоку статус. При активації в нас дійсно нічого не борано - тому виводимо повідомлення про вибір
        $('#captchaImageStatus').removeClass('hide').text('Select image!');
        captcha.working = true;
        captcha.image = true;
    });

    //Перемикач. Будемо Активувати/Дизактивуватти "залежні" елементи
    $('#captchaImage').on('statusChange', function(event, state){
        console.log("HERE!", state);
        switch (state){
            case 'disable':
                console.log("CaptchaImage : status disable");
                $('#captchaImage').addClass('disabled');
                $('#captchaImageStatus').addClass('hide');
                $('#captchaInput').addClass('disabled');
                $('#captchaInputStatus').addClass('hide');
                break;
            case 'enable':
                console.log("CaptchaImage : status enable");
                $('#captchaImage').removeClass('disabled');
                break;
            case 'hasImg':
                console.log("CaptchaImage : status hasImg");
                $('#captchaImageStatus').removeClass('hide').text('Image is selected!');
                $('#captchaImageStatus').css('color', 'green');
                $('#captchaImage').addClass('disabled');
                $('#captchaInput').removeClass('disabled');
                break;
            default:
                break;
        }
    });

    $('#captchaInput').on('click', function(e){
        //Пишемо збоку статус. При активації в нас дійсно нічого не Обрано - тому виводимо повідомлення про вибір
        $('#captchaInputStatus').removeClass('hide').text('Select input!');
        captcha.input = true;
    });
});