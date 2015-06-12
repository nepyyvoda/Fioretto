/**
 * Created by anton.nepyyvoda on 02.06.2015.
 */
module.exports = function(id, data, allowedUpdateColumns) {
    var queryTemplate = '';
    var queryData = [];

    var keys = Object.keys(data);

    for(var i in keys) {
        if(allowedUpdateColumns.indexOf(keys[i]) === -1) {
            return false;
        }
        queryTemplate += '?? = ?,';

        queryData.push(keys[i]);
        queryData.push(data[keys[i]]);
    }
    queryData.push(id);

    return {
        template: queryTemplate.slice(0, -1),
        data: queryData
    }
};