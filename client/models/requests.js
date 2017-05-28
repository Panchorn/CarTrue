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
		get_in:{ type: Date },
		get_out:{ type: Date }
	},
	req_status:{ 
		type: String,
		enum: ["accepted", "waiting", "denied", "cancel"],
		default: "waiting"
	},
	note: { type: String },
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

// Get the Request by request_id
module.exports.getRequestByRequestId = function(requestid, callback) {
	Req.findOne({'request_id': requestid}, {'_id':0}, callback);
}

// Get the Request by route_id
module.exports.getRequestByRouteId = function(routeid, callback) {
	Req.find({'route_id': routeid}, {'_id':0}, callback);
}

// Get to show in history (for passenger)
module.exports.getRouteForHistoryP = function(passengerid, callback) {
	Req.find({'req_status': 'accepted', 'passenger_id': passengerid}, {'_id': 0, '__v': 0}, 
				callback);
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
	Req.findOneAndUpdate(query, {'timestamp': new Date()}, options , callback);
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
//     "_id" : ObjectId("585e4366e27725c2b38f99bc"),
//     "request_id" : "1",
//     "route_id" : "1",
//     "passenger_id" : "5",
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
//         "get_in" : ISODate("2016-12-12T16:30:00.000Z"),
//         "get_out" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "req_status" : "accepted",
//     "note" : "wear a white shirt"
// }

// /* 2 */
// {
//     "_id" : ObjectId("585e4701e27725c2b38f99bd"),
//     "request_id" : "2",
//     "route_id" : "1",
//     "passenger_id" : "6",
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
//         "get_in" : ISODate("2016-12-12T16:30:00.000Z"),
//         "get_out" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "req_status" : "accepted",
//     "note" : "going to temple"
// }

// /* 3 */
// {
//     "_id" : ObjectId("585e47b3e27725c2b38f99be"),
//     "request_id" : "3",
//     "route_id" : "1",
//     "passenger_id" : "3",
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
//         "get_in" : ISODate("2016-12-12T16:30:00.000Z"),
//         "get_out" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "req_status" : "accepted",
//     "note" : "please accept me"
// }

// /* 4 */
// {
//     "_id" : ObjectId("585e4a20e27725c2b38f99bf"),
//     "request_id" : "4",
//     "route_id" : "2",
//     "passenger_id" : "2",
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
//         "get_in" : ISODate("2016-12-22T08:30:00.000Z"),
//         "get_out" : ISODate("2016-12-22T09:30:00.000Z")
//     },
//     "req_status" : "accepted",
//     "note" : "front of temple"
// }

// /* 5 */
// {
//     "_id" : ObjectId("585e4c32e27725c2b38f99c0"),
//     "request_id" : "5",
//     "route_id" : "2",
//     "passenger_id" : "4",
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
//         "get_in" : ISODate("2016-12-22T08:30:00.000Z"),
//         "get_out" : ISODate("2016-12-22T09:30:00.000Z")
//     },
//     "req_status" : "accepted",
//     "note" : "see me around big-c"
// }

// /* 6 */
// {
//     "_id" : ObjectId("585e4ed9e27725c2b38f99c1"),
//     "request_id" : "6",
//     "route_id" : "3",
//     "passenger_id" : "5",
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
//         "get_in" : ISODate("2016-12-13T09:30:00.000Z"),
//         "get_out" : ISODate("2016-12-13T11:00:00.000Z")
//     },
//     "req_status" : "accepted",
//     "note" : "go go go"
// }

// /* 7 */
// {
//     "_id" : ObjectId("585e5335e27725c2b38f99c2"),
//     "request_id" : "7",
//     "route_id" : "4",
//     "passenger_id" : "1",
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
//         "get_in" : ISODate("2016-12-16T09:00:00.000Z"),
//         "get_out" : ISODate("2016-12-16T09:30:00.000Z")
//     },
//     "req_status" : "accepted",
//     "note" : "accept me please"
// }

// /* 8 */
// {
//     "_id" : ObjectId("585e539ee27725c2b38f99c3"),
//     "request_id" : "8",
//     "route_id" : "4",
//     "passenger_id" : "5",
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
//     "req_status" : "timeout",
//     "note" : "i have pet"
// }

// /* 9 */
// {
//     "_id" : ObjectId("585e545ce27725c2b38f99c4"),
//     "request_id" : "9",
//     "route_id" : "4",
//     "passenger_id" : "6",
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
//     "req_status" : "denied",
//     "note" : "im gay"
// }

// /* 10 */
// {
//     "_id" : ObjectId("585e5497e27725c2b38f99c5"),
//     "request_id" : "10",
//     "route_id" : "4",
//     "passenger_id" : "6",
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
//     "req_status" : "cancel",
//     "note" : "hey where are you"
// }