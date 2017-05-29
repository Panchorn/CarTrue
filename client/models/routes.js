var db = require('./connection.js');
counter = require('./counters');

//Routes Schema
const routeSchema = db.Mongoose.Schema({ 
	route_id:{ type: String, index: { unique: true } },
	driver_id:{ type: String, required: true },
	origin:{
		name:{ type: String, required: true },
		lat:{ type: String, required: true },
		lng:{ type: String, required: true }
	},
	destination:{
		name:{ type: String, required: true },
		lat:{ type: String, required: true },
		lng:{ type: String, required: true }
	},
	date:{
		start:{ type: Date, required: true },
		arrived:{ type: Date }
	},
	seat:{ type: Number, required: true, enum: ["1","2","3"] },
	current_seat:{ type: Number, enum: [0, 1, 2, 3], default: 0 },
	direction:{ type: String, required: true },
	note: { type: String },
	route_status: { 
		type: String, 
		enum: ["ready", "in_travel", "arrived", "cancel"], 
		default: "ready" },
	rules: {
		maleAllow: { type: Boolean, default: true },
		femaleAllow: { type: Boolean, default: true },
		foodAllow: { type: Boolean, default: false },
		petAllow: { type: Boolean, default: false },
		babyAllow: { type: Boolean, default: false },
		smokeAllow: { type: Boolean, default: false }
	},
	timestamp:{ type: Date }
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

// Get all Routes 
module.exports.getAllRoutes = function(callback) {
	Rou.find({}, {'_id':0, '__v':0}, callback)//.limit(10);
}

// Get the Routes *(limit 10 documents)
module.exports.getRouteByDriverId = function(driverid, callback) {
	Rou.find({'driver_id': driverid}, callback)//.limit(10);
}

// Get all of the Route that ready
module.exports.getRouteByStatusReady = function(callback) {
	Rou.find({'route_status': 'ready'}, callback).sort({route_id: 'desc'})//.limit(10);
}

// Get the Routes(ready/intravel)
module.exports.getRouteByDriverIdAndStatus = function(driverid, callback) {
	Rou.findOne({'driver_id': driverid, 'route_status': {$in: ['ready','in_travel']}}, {'_id':0, '__v':0}, callback);
}

// Get more detail of each Route
module.exports.getRouteByRouteId = function(routeid, callback) {
	Rou.findOne({'route_id': routeid}, {'_id':0, '__v':0}, callback);
}

// Get to show in history (for driver)
module.exports.getRouteForHistoryD = function(driverid, callback) {
	Rou.find({'route_status': 'arrived', 'driver_id': driverid}, {'_id': 0, '__v': 0}, 
				callback).sort({'date.start': 'desc'});
	// Rou.find({$or: [{'route_status': 'arrived'}, {'route_status': 'cancel'}], 
	// 			'driver_id': driverid}, 
	// 			{'_id': 0, '__v': 0}, 
	// 			callback);
}

// Get Routes to select driver
module.exports.getRouteToSelectDriver = function(origin, destination, direction, gender, time, callback) {
	// gender is sex of passenger
	if (gender === 'male') {
		Rou.find({
			'route_status': 'ready', 
			'origin.name': origin, 
			'destination.name': destination,
			'rules.maleAllow': true,
			'date.start': { '$gte': time },
			$where:  'this.seat > this.current_seat',
			'direction': direction
		}, {'__v':0}, callback);
	}
	else if (gender === 'female') {
		Rou.find({
			'route_status': 'ready', 
			'origin.name': origin, 
			'destination.name': destination,
			'rules.femaleAllow': true,
			'date.start': { '$gte': time },
			$where:  'this.seat > this.current_seat',
			'direction': direction
		}, {'__v':0}, callback);
	}
}
// not use (old)
// // Get Routes to select driver
// module.exports.getRouteToSelectDriver = function(origin, destination, direction, callback) {
// 	Rou.find({
// 		'route_status': 'ready', 
// 		'origin.name': origin, 
// 		'destination.name': destination, 
// 		$where:  'this.seat > this.current_seat',
// 		'direction': direction
// 	}, {'__v':0}, callback);
// }

// Add new Route
module.exports.addRoute = function(route, callback) {
	Rou.create(route, callback);
}

// Update Timestamp after insert new route
module.exports.updateTimestamp = function(routeid, options, callback) {
	var query = {'route_id': routeid};
	Rou.findOneAndUpdate(query, {'timestamp': new Date()}, options , callback);
}

// Update Route
module.exports.updateRoute = function(routeid, route, options, callback) {
	var query = {'route_id': routeid};
	Rou.findOneAndUpdate(query, route, options, callback);
}

// Increase current_seat 1 (+1)
module.exports.incrementCurrentSeat = function(routeid, callback) {
	var query = {'route_id': routeid}
	Rou.findOne(query, {'current_seat':1, 'seat':1}, function(err, data) {	
		if (data.current_seat < data.seat) {
			Rou.findOneAndUpdate(query, {$inc: {'current_seat' : 1} }, {new: true}, function(err, data) {
				callback(data);
			});
		}
		else {
			callback('full');
		}
	});
}

// Decrease current_seat 1 (-1)
module.exports.decrementCurrentSeat = function(routeid, callback) {
	var query = {'route_id': routeid}
	Rou.findOne(query, {'current_seat':1, 'seat':1}, function(err, data) {	
		if (data.current_seat > 0) {
			Rou.findOneAndUpdate(query, {$inc: {'current_seat' : -1} }, {new: true}, callback);
		}
		else {
			callback('empty');
		}
	});
}

// Delete Route
module.exports.removeRoute = function(routeid, callback) {
	Rou.remove({'route_id': routeid}, callback);
}

//----------------------------------------------------------------------------
// for call from matching.js
//----------------------------------------------------------------------------

// Get the Routes
module.exports.getRouteToMatch = function(origin, destination, gender, time, callback) {
	// gender is sex of passenger
	if (gender === 'male') {
		Rou.find({
			'route_status': 'ready', 
			'origin.name': origin, 
			'destination.name': destination, 
			'rules.maleAllow': true,
			'date.start': { '$gte': time },
			$where:  'this.seat > this.current_seat'  
		}, {'__v':0}, callback);
	}
	else if (gender === 'female') {
		Rou.find({
			'route_status': 'ready', 
			'origin.name': origin, 
			'destination.name': destination, 
			'rules.femaleAllow': true,
			'date.start': { '$gte': time },
			$where:  'this.seat > this.current_seat'  
		}, {'__v':0}, callback);
	}
}


//-------------------------- data example---------------------------
// /* 1 */
// {
//     "_id" : ObjectId("592c5d0c1ca221a1bf1a6e34"),
//     "route_id" : "601",
//     "note" : "-",
//     "seat" : 3,
//     "driver_id" : "1",
//     "direction" : "eg~rA_vwdR_@tAYxB`Ef@`El@tARD[J_AFoALkD^aLFaBLwFD}BNwDDkAJiBRkHb@gLLoGVyGFwGHyB@mBRcHNaFJoE@e@JmAH}@?S?m@KeB@e@?o@H_A^mCL}@l@qDxAwI|AuGp@{Cb@iB~@uEj@wB|@_EvCyM~@iE|AqGv@cDd@wB^{An@uCl@oCh@{Cj@yC^{Ad@mB`@mB~@mElAeFx@oDd@iBRo@hBiE`GgKlAkB|BoCrAuB~AkC~BsD|@wA~CsFn@qB`@}AB[VsD`Cof@^{HEaC]qDUqBqFu`@a@yC}@_ISeCE{CHeBh@mEvC{Vz@_IHq@Ju@D]K}@MWWU]KWA]DYLYXGPC`@H\\RRb@^lBVn@H~Dp@nIrAh@HD?Ba@T}E?_@E_@Ac@XqFJoB",
//     "rules" : {
//         "smokeAllow" : false,
//         "babyAllow" : false,
//         "petAllow" : false,
//         "foodAllow" : false,
//         "femaleAllow" : true,
//         "maleAllow" : true
//     },
//     "route_status" : "cancel",
//     "current_seat" : 0,
//     "date" : {
//         "start" : ISODate("2017-05-30T17:40:00.000Z")
//     },
//     "destination" : {
//         "lat" : "13.73795",
//         "name" : "ARL Hua Mak",
//         "lng" : "100.64534"
//     },
//     "origin" : {
//         "lat" : "13.758232",
//         "name" : "A-Space Asoke-Ratchada",
//         "lng" : "100.560275"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T17:40:28.291Z")
// }

// /* 2 */
// {
//     "_id" : ObjectId("592c69111ca221a1bf1a6e36"),
//     "route_id" : "602",
//     "driver_id" : "4",
//     "seat" : 3,
//     "direction" : "eg~rA_vwdR_@tAYxB`Ef@`El@tARD[J_AFoALkD^aLFaBLwFD}BNwDDkAJiBRkHb@gLLoGVyGFwGHyB@mBRcHNaFJoE@e@JmAH}@?S?m@KeB@e@?o@H_A^mCL}@l@qDxAwI|AuGp@{Cb@iB~@uEj@wB|@_EvCyM~@iE|AqGv@cDd@wB^{An@uCl@oCh@{Cj@yC^{Ad@mB`@mB~@mElAeFx@oDd@iBRo@hBiE`GgKlAkB|BoCrAuB~AkC~BsD|@wA~CsFn@qB`@}AB[VsD`Cof@^{HEaC]qDUqBqFu`@a@yC}@_ISeCE{CHeBh@mEvC{Vz@_IHq@Ju@D]K}@MWWU]KWA]DYLYXGPC`@H\\RRb@^lBVn@H~Dp@nIrAh@HD?Ba@T}E?_@E_@Ac@XqFJoB",
//     "note" : "-",
//     "rules" : {
//         "smokeAllow" : false,
//         "babyAllow" : false,
//         "petAllow" : false,
//         "foodAllow" : false,
//         "femaleAllow" : true,
//         "maleAllow" : true
//     },
//     "route_status" : "arrived",
//     "current_seat" : 2,
//     "date" : {
//         "start" : ISODate("2017-05-29T22:31:00.000Z"),
//         "arrived" : ISODate("2017-05-29T18:36:00.000Z")
//     },
//     "destination" : {
//         "name" : "ARL Hua Mak",
//         "lat" : "13.73795",
//         "lng" : "100.64534"
//     },
//     "origin" : {
//         "name" : "A-Space Asoke-Ratchada",
//         "lat" : "13.758232",
//         "lng" : "100.560275"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T18:31:45.810Z")
// }

// /* 3 */
// {
//     "_id" : ObjectId("592c691b1ca221a1bf1a6e37"),
//     "route_id" : "603",
//     "note" : "-",
//     "seat" : 3,
//     "driver_id" : "2",
//     "direction" : "eg~rA_vwdR_@tAYxB`Ef@`El@tARD[J_AFoALkD^aLFaBLwFD}BNwDDkAJiBRkHb@gLLoGVyGFwGHyB@mBRcHNaFJoE@e@JmAH}@?S?m@KeB@e@?o@H_A^mCL}@l@qDxAwI|AuGp@{Cb@iB~@uEj@wB|@_EvCyM~@iE|AqGv@cDd@wB^{An@uCl@oCh@{Cj@yC^{Ad@mB`@mB~@mElAeFx@oDd@iBRo@hBiE`GgKlAkB|BoCrAuB~AkC~BsD|@wA~CsFn@qB`@}AB[VsD`Cof@^{HEaC]qDUqBqFu`@a@yC}@_ISeCE{CHeBh@mEvC{Vz@_IHq@Ju@D]K}@MWWU]KWA]DYLYXGPC`@H\\RRb@^lBVn@H~Dp@nIrAh@HD?Ba@T}E?_@E_@Ac@XqFJoB",
//     "rules" : {
//         "smokeAllow" : false,
//         "babyAllow" : false,
//         "petAllow" : false,
//         "foodAllow" : false,
//         "femaleAllow" : true,
//         "maleAllow" : true
//     },
//     "route_status" : "arrived",
//     "current_seat" : 1,
//     "date" : {
//         "start" : ISODate("2017-05-29T20:30:00.000Z"),
//         "arrived" : ISODate("2017-05-29T18:36:00.000Z")
//     },
//     "destination" : {
//         "lat" : "13.73795",
//         "name" : "ARL Hua Mak",
//         "lng" : "100.64534"
//     },
//     "origin" : {
//         "lat" : "13.758232",
//         "name" : "A-Space Asoke-Ratchada",
//         "lng" : "100.560275"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T18:31:55.629Z")
// }