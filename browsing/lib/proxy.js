var URL = require('url'),
    _ = require('lodash'),
    https = require('socks5-https-client'),
    http = require('socks5-http-client'),
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

            if(uri.hostname === null || uri.hostname === undefined){
                return;
            } else {
                options = {
                    host: uri.hostname,
                    port: uri.port,
                    path: uri.path,
                    method: data.clientRequest.method,
                    headers: data.headers,
                    socksPort: data.socksPort
                };

            }
            debug('sending remote request: ', options);

            var proto = (uri.protocol == 'https:') ? https : http;

            data.remoteRequest = proto.request(options, function (remoteResponse) {
                    if (remoteResponse) {
                        data.remoteResponse = remoteResponse;
                        data.remoteResponse.on('error', next);
                        proxyResponse(data);
                    } else {
                        remoteResponse.abort();
                    }
                });

                data.remoteRequest.on('error', next);

                // pass along POST data & let the remote server know when we're done sending data
                data.stream.pipe(data.remoteRequest);
                data.remoteRequest.end()

        }

    }

    function proxyResponse(data) {

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
