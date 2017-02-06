// //serv true
// const mongoose = require('mongoose');
// var opt = {
//         user: 'cartrueSWUrw',
//         pass: '8kiNmi^dy[,L;',
//         auth: {
//             authdb: 'PLEASE_READ'
//         }
//     };
// var db = mongoose.createConnection( '61.90.233.80', 'PLEASE_READ', 27017, opt);

// module.exports.Connection = db;
// module.exports.Mongoose = mongoose;

//serv lnw
const mongoose = require('mongoose');
var opt = {
        user: 'admin02',
        pass: 'pass',
        auth: {
            authdb: 'CarTrue'
        }
    };
var db = mongoose.createConnection( '47.88.241.73', 'CarTrue', 27017, opt);

module.exports.Connection = db;
module.exports.Mongoose = mongoose;


// //serv localhost
// const mongoose = require('mongoose');
// var opt = {
//         user: 'nadmin',
//         pass: 'nadmin',
//         auth: {
//             authdb: 'CarTrue'
//         }
//     };
// var db = mongoose.createConnection( 'localhost', 'CarTrue', 27017, opt);

// module.exports.Connection = db;
// module.exports.Mongoose = mongoose;