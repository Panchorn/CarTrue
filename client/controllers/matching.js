const mongoose = require('mongoose');
Rou = require('../models/routes');

// from passenger
module.exports.matchingRoute = function(origin, destination, gender, time, callback) {

    // get relative route 
    // result1 is data from Routes collection
    Rou.getRouteToMatch(origin, destination, gender, time, function(err, result1){
        if (err) { 
            console.error('have err najaaaa');
        }
        else if (result1.length === 0) {
            console.log('Have no route offer');
            callback('Have no route offer now');
        }
        else { 
            console.log('in matching progress najaaaa');
            callback(result1);
        }
    });
}