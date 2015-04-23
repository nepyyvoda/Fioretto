var extend = require('extend');

function response(status, data) {
    var responseData = data || {};
    var statuses = {
        SUCCESS: {
            status: 0,
            message: 'Request has been successfully processed'
        },
        INTERNAL_SERVER_ERROR: {
            status: 1,
            message: 'Internal server error occurred'
        },
        AUTHORIZATION_FAILED: {
            status: 2,
            message: 'Authorization failed'
        },
        PERMISSION_DENIED: {
            status: 3,
            message: 'Permission denied'
        },
        UNDEFINED_ERROR: {
            status: 4,
            message: 'Undefined error occurred'
        },
        USER_ALREADY_EXIST: {
            status: 5,
            message: 'User already exist'
        },
        USER_NOT_FOUND: {
            status: 5,
            message: 'User not found'
        }
    };

    if(status in statuses) {
        return {
            status: statuses[status].status,
            data: extend(statuses[status].message, responseData)
        }
    }
    return {
        status: statuses['UNDEFINED_ERROR'].status,
        data: responseData
    }
}
module.exports = response;