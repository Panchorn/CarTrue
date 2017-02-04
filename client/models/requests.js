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
		enum: ["accepted","waiting","denied","timeout","cancel"],
		default: "waiting"
	},
	note: { type: String },
	timestamp:{ type: Date, default: Date.now }
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

// Get the Request by route_id
module.exports.getRequestByRouteId = function(routeid, callback) {
	Req.find({'route_id': routeid, 'req_status': 'accepted'}, {'_id':0}, callback);
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


//----------------------------------------------------------------------------
// for change status to timeout
//----------------------------------------------------------------------------

// function changeStatusToTimeout() {
// 	var util = require('util');
// 	var events = require('events');
// 	class Ticker { 
// 		constructor(){
// 			let handler = () => this.emit('tick');

// 			setInterval(handler, 1000); 
// 		}
// 	}
// 	util.inherits(Ticker, events.EventEmitter);
// 	let ticker = new Ticker(); 
// 	let i = 0;

	 
// 		ticker.on('tick', function() {
// 			i++;
// 			console.log(i);
// 			if (i <= 5) ticker.emit('tick');
// 		});
// }




//-------------------------- data example---------------------------
// /* 1 */
// {
//     "request_id" : "0001",
//     "route_id" : "0001",
//     "passenger_id" : "0005",
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
//     "request_id" : "0002",
//     "route_id" : "0001",
//     "passenger_id" : "0006",
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
//     "request_id" : "0003",
//     "route_id" : "0001",
//     "passenger_id" : "0003",
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
//     "request_id" : "0004",
//     "route_id" : "0002",
//     "passenger_id" : "0002",
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
//     "request_id" : "0005",
//     "route_id" : "0002",
//     "passenger_id" : "0004",
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
//     "request_id" : "0006",
//     "route_id" : "0003",
//     "passenger_id" : "0005",
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
//     "request_id" : "0007",
//     "route_id" : "0004",
//     "passenger_id" : "0001",
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
//     "request_id" : "0008",
//     "route_id" : "0004",
//     "passenger_id" : "0005",
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
//     "request_id" : "0009",
//     "route_id" : "0004",
//     "passenger_id" : "0006",
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
//     "request_id" : "0010",
//     "route_id" : "0004",
//     "passenger_id" : "0006",
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