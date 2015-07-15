/**
 * Created by anton.nepyyvoda on 15.07.2015.
 */
var assert = require('assert');
var expect = require('chai').expect;
var formatter = require("../models/formatter/update");
describe('Formatter', function() {
    describe('update', function () {
        it('should return object with (string)"template" and (array)"data" fields values are correct', function () {
            var sql = formatter(1, {key1: 1, key2: 'key2'}, ['key1', 'key2']);

            expect(sql).to.deep.equal({
                template: '?? = ?,?? = ?',
                data: [
                    'key1',
                    1,
                    'key2',
                    'key2',
                    1
                ]
            });
        });
        it('should return false when not all fields in allowed list', function () {
            var sql = formatter(1, {key1: 1, key2: 'key2'}, ['key1']);

            expect(sql).to.equal(false);
        });
    });
});