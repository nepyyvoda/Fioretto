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
    };

    function getFlashVersion() {
        // ie
        try {
            try {
                // avoid fp6 minor version lookup issues
                // see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
                var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
                try {
                    axo.AllowScriptAccess = 'always';
                }
                catch(e) {
                    return '6,0,0';
                }
            }
            catch(e) {}
            return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
        }
            // other browsers
        catch(e) {
            try {
                if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
                    return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
                }
            }
            catch(e) {}
        }
        return false;

    }

    if( getFlashVersion()){
        $('#iframe-warning').openModal();
    }

    updatePageData();
});