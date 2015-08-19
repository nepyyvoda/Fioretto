/**
 * @author Vitaliy Kovalchuk, created on 11.08.2015.
 */
/*
* Data example {'login': 'DESC', 'name': 'ASC'}
*
* */

module.exports = function( data) {
    var queryTemplate = '';
    var queryData = [];

    var DESC = new RegExp("DESC", "gmi");

    var keys = Object.keys(data);

    for(var i in keys) {

        queryData.push(keys[i]);

        if(data[keys[i]] !== undefined && data[keys[i]].match(DESC)){
            queryTemplate += ' ?? DESC,';
        } else{
            queryTemplate += ' ?? ASC,';
        }
    }

    return {
        template: queryTemplate.slice(0, -1),
        data: queryData
    }
};