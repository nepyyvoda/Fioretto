/**
 * @author Vitaliy Kovalchuk, created on 11.08.2015.
 */
/*
* Data example {'amount': {
*                           'min_value': 50,
*                           'max_value': 60
*                           },
*                           .....
*               }
* */

module.exports = function( data) {
    var queryTemplate = '';
    var queryData = [];

    var keys = Object.keys(data);

    for(var i in keys) {

        queryTemplate += ' ( ?? BETWEEN ? AND ? ) AND';

        queryData.push(keys[i]);
        var tmp = Object.keys(data[keys[i]]);
        for(var j in tmp) {

            queryData.push(data[keys[i]][tmp[j]])
        }
    }

    return {
        template: queryTemplate.slice(0, -3),
        data: queryData
    }
};