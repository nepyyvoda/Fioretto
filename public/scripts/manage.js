/**
 * Created by anton.nepyyvoda on 15.12.2014.
 */

function validateURL(textval) {
    var urlregex = new RegExp(
        "^(http|https)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    return urlregex.test(textval);
}
function str_replace ( search, replace, subject ) {
    // Replace all occurrences of the search string with the replacement string
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Gabriel Paderni
    if(!(replace instanceof Array)){
        replace=new Array(replace);
        if(search instanceof Array){//If search is an array and replace is a string, then this replacement string is used for every value of search
            while(search.length>replace.length){
                replace[replace.length]=replace[0];
            }
        }
    }
    if(!(search instanceof Array))search=new Array(search);
    while(search.length>replace.length){//If replace has fewer values than search , then an empty string is used for the rest of replacement values
        replace[replace.length]='';
    }
    if(subject instanceof Array){//If subject is an array, then the search and replace is performed with every entry of subject , and the return value is an array as well.
        for(k in subject){
            subject[k]=str_replace(search,replace,subject[k]);
        }
        return subject;
    }
    for(var k=0; k<search.length; k++){
        var i = subject.indexOf(search[k]);
        while(i>-1){
            subject = subject.replace(search[k], replace[k]);
            i = subject.indexOf(search[k],i);
        }
    }
    return subject;
}

//function internal for find element by _id:

function findIndexByProperty(array, property, value){
    if(array instanceof Array && property !== undefined && value !== undefined)
        for(var i = 0; i < array.length; i++){
            if(array[i][property] === value){
                return i;
            }
        }

    return -1;
}

$(document).ready(function() {

    var id ='';
    var mapVotindNodes = [];


    $('#initvoting').on('click',  function(e) {
        e.preventDefault();
        if(validateURL($('[name="url"]').val())) {
            $.post( '/', {
                url: $.trim($('[name="url"]').val())
            } , function(res) {
                if(res.status == 0) {
                    //todo save url to config
                    window.location = '/voting?url=' + encodeURIComponent($('[name="url"]').val()) + '&proxy=' + encodeURIComponent(res.proxy);
                }
            })
        }
    });

    $('.start-voting').click(function(e) {
        id = str_replace('"', '', $(e.currentTarget).closest('tr').attr('data-votingid'));
        var url = '/api/voting/votingnodes/';
        var urlStartVoting = '/api/voting/start';

        //Check: do we have checked nodes for voting
        $.ajax({
            type: "GET",
            url: url + id,
            success:function(data){
                if(data.idsnodes !== undefined && data.idsnodes.length > 0) {
                    console.log("GO!");
                    startVoting();
                }else
                    console.log("No GO!");
            },
            error:function(error){
                console.log(error);
            }
        });

        var startVoting = function(){
            $.ajax({
                type: "POST",
                url: urlStartVoting,
                data: { _id: id},
                success: function(data){
                    if(data.status == 1)
                        console.log();
                },
                error: function(error){

                }
            });
        };
    });

    $('.stop-voting').click(function(e) {
        console.log("Stop voting!");
    });

    $('.remove-voting').click(function(e) {
        id = str_replace('"', '', $(e.currentTarget).closest('tr').attr('data-votingid'));
    });

    $('.btn-remove-yes').on('click', function(e) {
        var url = '/api/voting/delete';
        var urlvotingnodes = '/voting/votingnodes/delete/';

        $.ajax({
            type: "POST",
            url: url,
            data: {id: id},
            success: function(data)
            {
                //
                if(data.status === 0){
                    $.ajax({
                        type: "POST",
                        url: urlvotingnodes + id,
                        success: function(response){
                            $('*[data-votingid="\\"' + id + '\\""]').remove();
                            console.log();
                        },
                        error: function(err){
                            console.log("ERR: voting nodes not deleted");
                        }
                    });
                }else
                    alert("Voting is not deleted!");
            },
            error: function (err){
                window.location.reload(true);
                alert("Sorry! Have some problem");
            }
        });
    });

    $('.edit-voting').click(function(e){
        var data = undefined;
        var url = '/api/nodevoting/nodes';
        var urlVotingNodes = '/api/voting/votingnodes/';
        id = str_replace('"', '', $(e.currentTarget).closest('tr').attr('data-votingid'));


        //Get available nodes for present on modal window
        $.ajax({
            type: "GET",
            url: url,
            success:function(returnData)
            {
                if(returnData !== undefined) {

                    //We need clear checked by previous
                    if(NodeTableModelObj.arrayNode !== undefined) {
                        NodeTableModelObj.arrayNode.removeAll();
                    }

                    for(var i = 0; i < returnData.length; i++){
                        NodeTableModelObj.arrayNode.push(new NodeModel(returnData[i]));
                    }
                }
            },
            error: function (err){
                console.log("ERROR .edit-voting");
            }
        });

        //Get checked nodes for concrete voting
        $.ajax({
            type: "GET",
            url: urlVotingNodes + id,
            success: function(returnData){
                /*PROTOTYPE returnData:
                 var returnData = {
                     idvoting: '',
                     idsnodes: []
                 }
                * */
                var array = NodeTableModelObj.arrayNode();

                if(returnData.idsnodes !== undefined)
                    for(var i = 0; i < returnData.idsnodes.length; i++) {
                        var index = findIndexByProperty(array, '_id', returnData.idsnodes[i])
                        if(index !== -1){
                            NodeTableModelObj.arrayNode()[index].use(true);
                        }else{
                            //Якщо ми не знаходимо таку ноду - отже вона видалена, але залишилась у повязаному списку
                            console.log("NOT FIND! " + returnData.idsnodes[i]);
                        }
                    }
            },
            error: function(err){
                console.log("ERROR .edit-voting");
            }
        });

    });

    //Post checked Nodes for voting!
    $('.btn-complete').click(function(e){
        var urlVotingNodes = '/api/voting/votingnodes/edit';
        var objVotingNodes = {};// = { idvoting: '', idsnodes: [] }

        objVotingNodes.idsnodes = [];

        //find checked nodes:
        for(var i = 0; i < NodeTableModelObj.arrayNode().length; i++){

            if(NodeTableModelObj.arrayNode()[i].use()) {
                objVotingNodes.idsnodes.push(NodeTableModelObj.arrayNode()[i]._id);
            }
            //Clear all check
            //NodeTableModelObj.arrayNode()[i].use(false);
        }

        objVotingNodes.idvoting = id;
        $.ajax({
            type: "POST",
            url: urlVotingNodes,
            dataType: 'JSON',
            data: objVotingNodes,
            success: function(returnData){

            },
            error: function(err){
                console.log("ERROR .edit-voting");
            }
        });
    });


    //Knockout part for show/check nodes

    function NodeModel(data){
        var self = this;
        self._id = data._id;
        self.name = data.name;
        self.ip = data.ip;
        self.port = data.port;
        self.cores = data.cores;
        self.use = ko.observable();
        self.use(false);
        //self.use(false);
    }

    function NodeTableModel(){
        var self = this;

        self.arrayNode = ko.observableArray([]);
    }

    var NodeTableModelObj = new NodeTableModel();

    ko.applyBindings(NodeTableModelObj);

    //
});

