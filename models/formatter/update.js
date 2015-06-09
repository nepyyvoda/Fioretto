/**
 * Created by anton.nepyyvoda on 02.06.2015.
 */

module.exports = function(id, data, allowedUpdateColumns) {
    var queryTemplate = '';
    var queryData = [];

    for(key in data) {
        if(allowedUpdateColumns.indexOf(key) === -1) {
            return false;
        }
        queryTemplate += '?? = ?,';

        queryData.push(key);
        queryData.push(data[key]);
    };

    queryData.push(id);
    return {
        template: queryTemplate.slice(0, -1),
        data: queryData
    }
};