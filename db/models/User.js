/**
 * Created by anton.nepyyvoda on 14.04.2015.
 */
var AppModel = require('../index');

var User = AppModel.extend({
    tableName: "users"
});

module.exports = User;