var FCM = require('fcm-node');

var serverKey = 'AAAAi-L8ioo:APA91bEBXNEjneBIq6u6vp7VZNbjCVC2uzP0G0N4kUBfycL0CnxFmkRyFgC7SKaX4UDlYy7oX29uqUe7nYFbupkHXWJnZdL9pLE50AWyNEgbifXAHN-u7x9v9_j_qB6OOPbi0PcEuwmx';
var fcm = new FCM(serverKey);
Emp = require('../models/employees');


module.exports.sendnoti = function(driverid, passengerName, callback) {
    Emp.getEmpById(driverid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Hey ! ' + data.employee.fName, 
                body: passengerName + ' want to join your ride !!!',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                msg : 'driver',
                action : 'request'
            }
        };
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    });
}

module.exports.sendnotitopass = function(passengerid, driverName, result, callback) {
    Emp.getEmpById(passengerid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Hey ! ' + data.employee.fName, 
                body: driverName + ' ' + result + ' your request !!!',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                msg : 'passenger',
                action : result
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

module.exports.sendNotiWhenRouteCancel = function(passengerid, driverName, result, callback) {
    Emp.getEmpById(passengerid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Sorry ! ' + data.employee.fName, 
                body: driverName + ' cancel the ride, You must find new rider',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                msg : 'passenger',
                action : 'cancel'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

module.exports.sendNotiWhenRequestCancel = function(driverid, passengerName, result, callback) {
    Emp.getEmpById(driverid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Hey ! ' + data.employee.fName, 
                body: passengerName + ' can\'t travel with you now, thank you for acceptance.',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                msg : 'driver',
                action : 'cancel'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

// new added
module.exports.sendNotiWhenCancel = function(driverid, result, callback) {
    Emp.getEmpById(driverid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            data: {  //you can send only notification or only data(or include both)
                msg : 'driver',
                action : 'cancel'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

module.exports.sendNotiWhenStart = function(passengerid, driverName, result, callback) {
    Emp.getEmpById(passengerid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Let\'s go ! ' + data.employee.fName, 
                body: driverName + ' is in travel, see you at starting point.',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                msg : 'passenger',
                action : 'start'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

// new added
module.exports.sendNotiToGetCurLo = function(driverid, result, callback) {
    Emp.getEmpById(driverid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            data: {  //you can send only notification or only data(or include both)
                msg : 'driver',
                action : 'start'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

module.exports.sendNotiToWhoMissTravel = function(passengerid, driverName, result, callback) {
    Emp.getEmpById(passengerid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Hey ! ' + data.employee.fName + ' you miss the travel', 
                body: driverName + ' are arrived, join with us next time.',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                msg : 'passenger',
                action : 'arrived'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

module.exports.sendNotiToWhoInTravel = function(passengerid, driverName, result, callback) {
    Emp.getEmpById(passengerid, function (err, data) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, etcetera)
            to: data.employee.regtoken,
            priority: 'high',
            contentAvailable: true,
            notification: {
                title: 'Hey ! ' + data.employee.fName, 
                body: driverName + ' are arrived,and grad to see you.',
                sound: "default"
            },
            data: {  //you can send only notification or only data(or include both)
                msg : 'passenger',
                action : 'arrived'
            }
        };
        fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
        });
    });
}

