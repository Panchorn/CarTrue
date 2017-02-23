var FCM = require('fcm-node');

var serverKey = 'AAAAi-L8ioo:APA91bEBXNEjneBIq6u6vp7VZNbjCVC2uzP0G0N4kUBfycL0CnxFmkRyFgC7SKaX4UDlYy7oX29uqUe7nYFbupkHXWJnZdL9pLE50AWyNEgbifXAHN-u7x9v9_j_qB6OOPbi0PcEuwmx';
var fcm = new FCM(serverKey);
Emp = require('../models/employees');


module.exports.sendnoti = function(driverid, fname, callback) {
    Emp.getEmpById(driverid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Hey ! ' + data.employee.fName, 
                body: fname + ' want to join your ride !!!',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                title: 'Hey ! ' + data.employee.fName, 
                body: 'someone want to join your ride !!!'
            }
        };
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
            //callback(data.employee.regtoken);
            callback(response);
        });
    });
}

module.exports.sendnotitopass = function(passengerid,fname,result, callback) {
    Emp.getEmpById(passengerid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Hey ! ' + data.employee.fName, 
                body: fname +' '+result+ ' your request !!!',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                title: 'Hey ! ' + data.employee.fName, 
                body: 'someone want to join your ride !!!'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            //callback(data.employee.regtoken);
            callback(response);
        });
    });
}