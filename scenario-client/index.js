/**
 * Created by anton.nepyyvoda on 15.06.2015.
 */
var log = require('../logger')(module);
var net = require('net');
//var server = require('../testserver');

function sendToNodeVoting(neededDataForVoting, res, callback){
    var HOST = neededDataForVoting.node.ip;
    var PORT = neededDataForVoting.node.port;
    console.log(neededDataForVoting.node.ip + ",  == " + neededDataForVoting.node.port);

    console.log("neededDataForVoting.vote");
    console.log(neededDataForVoting.vote);
    //console.log("HOST : " + HOST + ", PORT : " + PORT);

    var client = new net.Socket();
    client.connect(PORT, HOST, function() {

        log.info('Socket. Connected to: ' + HOST + ':' + PORT);
        // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
        client.write(JSON.stringify(neededDataForVoting));
        callback.data("START VOTING!", res, {status: 1});
    });

    // Add a 'data' event handler for the client socket
    // data is what the server sent to this socket
    client.on('data', function(data) {

        log.info('Socket. Data: ' + data);
        // Close the client socket completely
        client.destroy();

    });

    // Add a 'close' event handler for the client socket
    client.on('close', function() {
        log.info('Socket. Connection closed');
    });

    client.on('error', function(err){
        log.log('Error occured:', err);
        callback.data("Socket. Bad connection with nodes", res);
    });
}

module.exports.sendToNodeVoting = sendToNodeVoting;