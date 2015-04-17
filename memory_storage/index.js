/**
 * Created by anton.nepyyvoda on 16.04.2015.
 */
var redis = require("redis"),
    client = redis.createClient();

var log = require('../logger')(module);

client.on('connect', function(err) {
    log.info('Successfully connected to Redis.');
});

client.on('error', function (err) {
    log.warn('Redis error occured: ' + err);
});
client.on('end', function(err) {
    log.info('Connection to Redis has been lost. ' + err);
});

module.exports = client;