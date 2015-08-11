/**
 * Created by anton.nepyyvoda on 03.04.2015.
 */
//#!/usr/bin/env node
var config = require('../config');
var debug = require('debug')('server');
var app = require('../app');
var vpn = require('../browsing/vpn');

app.set('port', process.env.PORT || config.get('port'));

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
//vpn.startTor();
