var db = require('./connection.js');
counter = require('./counters');

//Requests Schema
const requestSchema = db.Mongoose.Schema({ 
	request_id:{ type: String, index: { unique: true } },
	route_id:{ type: String, required: true },
	passenger_id:{ type: String, required: true },
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
		time:{ type: Date },
		get_in:{ type: Date },
		get_out:{ type: Date }
	},
	req_status:{ 
		type: String,
		enum: ["waiting", "accepted", "denied", "in_travel", "cancel", "arrived"],
		default: "waiting"
	},
	note: { type: String },
	req_expire:{ type: Date },
	timestamp:{ type: Date }
}, {collection:'Requests'});

//----------------------------------------------------------------------------
// for auto increment request_id 
//----------------------------------------------------------------------------

requestSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'request_id'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.request_id = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------

const Req = module.exports =  db.Connection.model('Requests', requestSchema);

// Get all Requests
module.exports.getAllRequests = function(callback) {
	Req.find({}, {'_id':0, '__v':0}, callback)//.limit(10);
}

// Get the Request by request_id
module.exports.getRequestByRequestId = function(requestid, callback) {
	Req.findOne({'request_id': requestid}, {'_id':0}, callback);
}

// Get the Request by route_id
module.exports.getRequestByRouteId = function(routeid, callback) {
	Req.find({'route_id': routeid}, {'_id':0}, callback);
}

// Get the Request by passenger_id
module.exports.getRequestByPassengerId = function(passengerid, callback) {
	Req.find({'passenger_id': passengerid, 'req_status': {$in: ['waiting', 'accepted', 'in_travel']}}, {'_id':0}, callback);
}

// Get the Request by route_id and req_status == 'arrived'
module.exports.getRequestByRouteIdAndArrived = function(routeid, callback) {
	Req.find({'route_id': routeid, 'req_status': 'arrived'}, {'_id':0}, callback);
}

// Get the Request by route_id and req_status == 'waiting', 'accepted'
module.exports.getRequestByRouteIdAndStatus = function(routeid, callback) {
	Req.find({'route_id': routeid, 'req_status': {$in: ['waiting', 'accepted', 'cancel','in_travel']}}, 
		{'_id':0}, callback);
}

// Get to show in history (for passenger)
module.exports.getRequestForHistoryP = function(passengerid, callback) {
	Req.find({'req_status': 'arrived', 'passenger_id': passengerid}, {'_id': 0, '__v': 0}, 
				callback).sort({'date.get_in': 'desc'});
	//	Req.find({$or: [{'req_status': 'denied'}, {'req_status': 'accepted'}], 
				// 'passenger_id': passengerid}, 
				// {'_id': 0, '__v': 0}, 
				// callback);
}

// Add new Request
module.exports.addRequest = function(request, callback) {
	Req.create(request, callback);
}

// Update Timestamp after insert new request
module.exports.updateTimestamp = function(requestid, options, callback) {
	var query = {'request_id': requestid};
	Req.findOneAndUpdate(query, {'timestamp': new Date(), 'req_expire': (new Date()).getTime() + 60000}, options , callback);
}

// Update Request
module.exports.updateRequest = function(requestid, request, options, callback) {
	var requestid = {'request_id': requestid};
	Req.findOneAndUpdate(requestid, request, options, callback);
}

// Delete Request
module.exports.removeRequest = function(requestid, callback) {
	Req.remove({'request_id': requestid}, callback);
}

// Update status (cancel)
module.exports.updateStatusCancel = function(requestid, options, callback) {
	var requestid = {'request_id': requestid};
	var request = {$set:{'req_status': 'cancel'}};
	Req.findOneAndUpdate(requestid, request, options, callback);
}


//-------------------------- data example---------------------------
// /* 1 */
// {
//     "_id" : ObjectId("592c48511ca221a1bf1a6e07"),
//     "request_id" : "801",
//     "route_id" : "595",
//     "passenger_id" : "4",
//     "note" : "",
//     "req_status" : "cancel",
//     "date" : {
//         "time" : ISODate("2017-05-29T16:11:00.000Z")
//     },
//     "destination" : {
//         "name" : "Fortune Town",
//         "lat" : "13.75762",
//         "lng" : "100.5648"
//     },
//     "origin" : {
//         "name" : "Srinakharinwirot University",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T16:12:01.995Z"),
//     "req_expire" : ISODate("2017-05-29T16:13:01.995Z")
// }

// /* 2 */
// {
//     "_id" : ObjectId("592c48991ca221a1bf1a6e08"),
//     "request_id" : "802",
//     "route_id" : "595",
//     "passenger_id" : "4",
//     "note" : "",
//     "req_status" : "cancel",
//     "date" : {
//         "time" : ISODate("2017-05-29T16:11:00.000Z")
//     },
//     "destination" : {
//         "name" : "Fortune Town",
//         "lat" : "13.75762",
//         "lng" : "100.5648"
//     },
//     "origin" : {
//         "name" : "Srinakharinwirot University",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T16:13:13.826Z"),
//     "req_expire" : ISODate("2017-05-29T16:14:13.826Z")
// }

// /* 3 */
// {
//     "_id" : ObjectId("592c494b1ca221a1bf1a6e14"),
//     "request_id" : "803",
//     "route_id" : "596",
//     "passenger_id" : "5",
//     "note" : "",
//     "req_status" : "arrived",
//     "date" : {
//         "time" : ISODate("2017-05-29T16:15:00.000Z"),
//         "get_in" : ISODate("2017-05-29T16:16:00.000Z"),
//         "get_out" : ISODate("2017-05-29T16:16:00.000Z")
//     },
//     "destination" : {
//         "name" : "BTS Bang Wa",
//         "lat" : "13.720698",
//         "lng" : "100.457804"
//     },
//     "origin" : {
//         "name" : "A-Space Asoke-Ratchada",
//         "lat" : "13.758232",
//         "lng" : "100.560275"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T16:16:11.362Z"),
//     "req_expire" : ISODate("2017-05-29T16:17:11.362Z")
// }

// /* 4 */
// {
//     "_id" : ObjectId("592c4c8b1ca221a1bf1a6e1a"),
//     "request_id" : "804",
//     "route_id" : "597",
//     "passenger_id" : "4",
//     "note" : "",
//     "req_status" : "arrived",
//     "date" : {
//         "time" : ISODate("2017-05-29T16:29:00.000Z"),
//         "get_in" : ISODate("2017-05-29T16:31:00.000Z"),
//         "get_out" : ISODate("2017-05-29T16:31:00.000Z")
//     },
//     "destination" : {
//         "name" : "Central Rama 9",
//         "lat" : "13.758439",
//         "lng" : "100.566164"
//     },
//     "origin" : {
//         "name" : "Srinakharinwirot University",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T16:30:03.764Z"),
//     "req_expire" : ISODate("2017-05-29T16:31:03.764Z")
// }

// /* 5 */
// {
//     "_id" : ObjectId("592c4c8d1ca221a1bf1a6e1b"),
//     "request_id" : "805",
//     "route_id" : "597",
//     "passenger_id" : "5",
//     "note" : "",
//     "req_status" : "arrived",
//     "date" : {
//         "time" : ISODate("2017-05-29T16:29:00.000Z"),
//         "get_in" : ISODate("2017-05-29T16:31:00.000Z"),
//         "get_out" : ISODate("2017-05-29T16:31:00.000Z")
//     },
//     "destination" : {
//         "name" : "Central Rama 9",
//         "lat" : "13.758439",
//         "lng" : "100.566164"
//     },
//     "origin" : {
//         "name" : "Srinakharinwirot University",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804"
//     },
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-29T16:30:05.061Z"),
//     "req_expire" : ISODate("2017-05-29T16:31:05.061Z")
// }
