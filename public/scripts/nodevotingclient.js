/**
 * Created by vitaliy on 22.01.15.
 */

function str_replace ( search, replace, subject ) { // Replace all occurrences of the search string with the replacement string
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

//form data transform into json
function form_to_json (selector) {
    var ary = $(selector).serializeArray();
    var obj = {};
    for (var a = 0; a < ary.length; a++) obj[ary[a].name] = ary[a].value;
    return obj;
}

$(document).ready(function() {
    var oldNode = {};

    $('#addnode').on('click',  function(e) {
        e.preventDefault();
        var url = "/api/nodevoting/add";
        var votingid = window.location.pathname.toString().split('/').pop();
        var data = $("#add-node").serialize() + "&votingid=" + votingid;
        console.log(data);
        $.ajax({
            type: "POST",
            url: url,
            data: data, // serializes the form's elements.
            success: function(data)
            {
                window.location.reload(true);
                if(data.status === 0)
                    alert("Node is added!");
                else
                    alert("Node is not added!");
            },
            error: function (err){
                window.location.reload(true);
                alert("Sorry! Have some problem");
            }
        });

        return false; // avoid to execute the actual submit of the form.
    });

    $('.remove-button').on('click', function (e) {
        var url = '/api/nodevoting/delete';
        var id = str_replace('"', '', $(e.currentTarget).closest('tr').attr('data-node'));

        $.ajax({
            type: "POST",
            url: url,
            data: {id: id},
            success: function(data)
            {
                if(data.status === 1)
                    alert("Node is deleted!");
                else
                    alert("Node is not deleted!");
            },
            error: function (err){
                window.location.reload(true);
                alert("Sorry! Have some problem");
            }
        });
    });

    $('.edit-button').on('click', function(e){
        var element = $(e.currentTarget).closest('tr');

        oldNode._id = str_replace('"', '', element.attr('data-node'));
        oldNode.name = str_replace('"', '', element.children('td').closest('.td-name').text());
        oldNode.ip = str_replace('"', '', element.children('td').closest('.td-ip').text());
        oldNode.port = str_replace('"', '', element.children('td').closest('.td-port').text());
        oldNode.cores = str_replace('"', '', element.children('td').closest('.td-cores').text());

        $('#inname').val(oldNode.name);
        $('#inip').val(oldNode.ip);
        $('#inport').val(oldNode.port);
        $('#incores').val(oldNode.cores);
        $('#editNodeModal').modal('show');
    });

    $('#editnode').on('click', function(e){
        var newNode = form_to_json('#edit-node');
        var url = '/api/nodevoting/edit';
        newNode._id = oldNode._id;
        console.log(newNode);

        $.ajax({
            type: "POST",
            url: url,
            data: newNode,
            success: function(data)
            {
                window.location.reload(true);
                if(data.status === 0)
                    alert("Success!");
                else
                    alert("Some trouble");
            },
            error: function (err){
                window.location.reload(true);
                alert("Sorry! Have some problem");
            }
        });
    });
});