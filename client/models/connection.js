//serv localhost
const mongoose = require('mongoose');
var opt = {
        user: 'nadmin',
        pass: 'nadmin',
        auth: {
            authdb: 'CarTrue'
        }
    };
var db = mongoose.createConnection( 'localhost', 'CarTrue', 27017, opt);

module.exports.Connection = db;
module.exports.Mongoose = mongoose;