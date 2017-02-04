var db = require('./connection.js');
counter = require('./counters');

//Routes Schema
const routeSchema = db.Mongoose.Schema({ 
	route_id:{ type: String, index: { unique: true } },
	driver_id:{ type: String, required: true },
	origin:{
		name:{ type: String, required: true },
		lat:{ type: String, required: true },
		lng:{ type: String, required: true },
		addr:{ type: String }
	},
	destination:{
		name:{ type: String, required: true },
		lat:{ type: String, required: true },
		lng:{ type: String, required: true },
		addr:{ type: String }
	},
	date:{
		start:{ type: Date, required: true },
		arrived:{ type: Date }
	},
	seat:{ type: String, required: true, enum: ["1","2","3"] },
	current_seat:{ type: String, enum: ["empty","remain","full"], default: "empty" },
	direction:{ type: String, required: true },
	note: { type: String },
	route_status: { 
		type: String, 
		enum: ["ready", "please_wait","in_travel", "arrived", "cancel"], 
		default: "please_wait" },
	timestamp:{ type: Date, default: Date.now }
}, {collection:'Routes'});

//----------------------------------------------------------------------------
// for auto increment route_id 
//----------------------------------------------------------------------------

routeSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'route_id'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.route_id = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------

const Rou = module.exports =  db.Connection.model('Routes', routeSchema);

// Get the Routes *(limit 10 documents)
module.exports.getRouteByDriverId = function(driverid, callback) {
	Rou.find({'driver_id': driverid}, 
				{'_id':0,'route_id':1, 'date':1, 'origin':1, 'destination':1}, 
				callback)//.limit(10);
}

// Get more detail of each Route
module.exports.getRouteByRouteId = function(routeid, callback) {
	Rou.findOne({'route_id': routeid}, {'_id':0, '__v':0}, callback);
}

// Get to show in history (for driver)
module.exports.getRouteForHistoryD = function(driverid, callback) {
	Rou.find({'route_status': 'arrived', 'driver_id': driverid}, {'_id': 0, '__v': 0}, 
				callback);
	// Rou.find({$or: [{'route_status': 'arrived'}, {'route_status': 'cancel'}], 
	// 			'driver_id': driverid}, 
	// 			{'_id': 0, '__v': 0}, 
	// 			callback);
}

// Add new Route
module.exports.addRoute = function(route, callback) {
	Rou.create(route, callback);
}

// Update Route
module.exports.updateRoute = function(routeid, route, options, callback) {
	var query = {'route_id': routeid};
	Rou.findOneAndUpdate(query, route, options, callback);
}

// Delete Route
module.exports.removeRoute = function(routeid, callback) {
	Rou.remove({'route_id': routeid}, callback);
}

//----------------------------------------------------------------------------
// for call from matching.js
//----------------------------------------------------------------------------

// Get the Routes
module.exports.getRouteToMatch = function(origin, destination, callback) {
	Rou.find({
		'route_status': 'ready', 
		'origin.name': origin, 
		'destination.name': destination, 
		'current_seat': {$ne: 'full'}
	}, {'__v':0}, callback);
}




//-------------------------- data example---------------------------
// /* 1 */
// {
//     "route_id" : "0001",
//     "driver_id" : "0001",
//     "direction_id" : "0001",
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "prakanong sukhumvit bkk"
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "date" : {
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "full",
//     "direction" : "url is here",
//     "note" : "hurry up!",
//     "route_status" : "arrived"
// }

// /* 2 */
// {
//     "route_id" : "0002",
//     "driver_id" : "0001",
//     "direction_id" : "0001",
//     "origin" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.7459332",
//         "lng" : "100.5325513",
//         "addr" : "patumwan bkk"
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "date" : {
//         "start" : ISODate("2016-12-22T08:30:00.000Z"),
//         "arrived" : ISODate("2016-12-22T09:30:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "url is here",
//     "note" : "so hungry!!!",
//     "route_status" : "arrived"
// }

// /* 3 */
// {
//     "route_id" : "0003",
//     "driver_id" : "0003",
//     "direction_id" : "0001",
//     "origin" : {
//         "name" : "True tower",
//         "lat" : "13.762409",
//         "lng" : "100.5659413",
//         "addr" : "dindaeng bkk"
//     },
//     "destination" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "prakanong sukhumvit bkk"
//     },
//     "date" : {
//         "start" : ISODate("2016-12-13T09:30:00.000Z"),
//         "arrived" : ISODate("2016-12-13T11:00:00.000Z")
//     },
//     "seat" : "2",
//     "current_seat" : "remain",
//     "direction" : "url is here",
//     "note" : "i have a class",
//     "route_status" : "arrived"
// }

// /* 4 */
// {
//     "route_id" : "0004",
//     "driver_id" : "0002",
//     "direction_id" : "0001",
//     "origin" : {
//         "name" : "Teminal 21",
//         "lat" : "13.7376599",
//         "lng" : "100.5582062",
//         "addr" : "sukhumvit19 bkk"
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "date" : {
//         "start" : ISODate("2016-12-16T09:00:00.000Z"),
//         "arrived" : ISODate("2016-12-16T09:30:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "url is here",
//     "note" : "where are you",
//     "route_status" : "arrived"
// }

// /* 5 */
// {
//     "route_id" : "0005",
//     "driver_id" : "0001",
//     "direction_id" : "0001",
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "prakanong sukhumvit bkk"
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "date" : {
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "empty",
//     "direction" : "direction najaaaaaaaa",
//     "note" : "Im on a bed",
//     "route_status" : "ready"
// }

// /* 6 */
// {
//     "route_id" : "0006",
//     "driver_id" : "0003",
//     "direction_id" : "0001",
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "prakanong sukhumvit bkk"
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "date" : {
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "1111111",
//     "note" : "1111111",
//     "route_status" : "ready"
// }

// /* 7 */
// {
//     "route_id" : "0007",
//     "driver_id" : "0005",
//     "direction_id" : "0002",
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "prakanong sukhumvit bkk"
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "date" : {
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "1111111",
//     "note" : "1111111",
//     "route_status" : "ready"
// }