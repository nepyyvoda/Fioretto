var URL = require('url'),
    http = require('http'),
    https = require('https'),
    _ = require('lodash'),
    contentTypes = require('./content-types.js'),
    debug = require('debug')('unblocker:proxy');


function proxy(config) {

    /**
     * Makes the outgoing request and relays it to the client, modifying it along the way if necessary
     */
    function proxyRequest(data, next) {

        debug('proxying %s %s', data.clientRequest.method, data.url);

        var middlewareHandledRequest = _.any(config.requestMiddleware, function(middleware) {
            middleware(data);
            return data.clientResponse.headersSent; // if true, then _.any will stop processing middleware here because we can no longer
        });

        if (!middlewareHandledRequest) {
            var uri = URL.parse(data.url);
            var options ;
            if(data.agent === undefined){
                 options = {
                    host: uri.hostname,
                    port: uri.port,
                    path: uri.path,
                    method: data.clientRequest.method,
                    headers: data.headers,
                    timeout: 30000
                };
            }else {

                 options = {
                    host: uri.hostname,
                    port: uri.port,
                    path: uri.path,
                    method: data.clientRequest.method,
                    headers: data.headers,
                    timeout: 30000,
                    agent: data.agent
                };
            }

            // what protocol to use for outgoing connections.
            var proto = (uri.protocol == 'https:') ? https : http;

            console.log( data.url);
            console.log(" Proto " + (uri.protocol == 'https:') ? "https" : "http");
            debug('sending remote request: ', options);
            data.remoteRequest = proto.request(options, function(remoteResponse) {
                data.remoteResponse = remoteResponse;
                data.remoteResponse.on('error', next);
                proxyResponse(data);
            });

            data.remoteRequest.on('error', next);

            // pass along POST data & let the remote server know when we're done sending data
            data.stream.pipe(data.remoteRequest);
        }

    }

    function proxyResponse(data) {

        debug('proxying %s response for %s', data.remoteResponse.statusCode, data.url);

        // make a copy of the headers to fiddle with
        data.headers = _.cloneDeep(data.remoteResponse.headers);

        // create a stream object fir middleware to pipe from and overwrite
        data.stream = data.remoteResponse;

        data.contentType = contentTypes.getType(data);

        var middlewareHandledResponse = _.any(config.responseMiddleware, function(middleware) {
            middleware(data);
            return data.clientResponse.headersSent; // if true, then _.any will stop processing middleware here
        });

        if (!middlewareHandledResponse) {
            //  fire off out (possibly modified) headers
            data.clientResponse.writeHead(data.remoteResponse.statusCode, data.headers);
            data.stream.pipe(data.clientResponse);
        }

    }

    return proxyRequest;
}

module.exports = proxy;
