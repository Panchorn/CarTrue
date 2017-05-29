var db = require('./connection.js');
counter = require('./counters');

//Current_Location Schema
const CurLoSchema = db.Mongoose.Schema({ 
	// curlo_id:{ type: String, index: { unique: true } },
	curloid_from_empid: { type: String, index: { unique: true } },
	location: [ { 
				  position: 
					{
						lat:{ type: String, required: true },
						lng:{ type: String, required: true }
					}
				}
			  ],
	timestamp:{ type: Date }
}, {collection:'Current_Location'});

//----------------------------------------------------------------------------
// for auto increment curloid_from_empid 
//----------------------------------------------------------------------------

CurLoSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'curloid_from_empid'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.curloid_from_empid = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------

const CurLo = module.exports =  db.Connection.model('Current_Location', CurLoSchema);

// Get all CurLo
module.exports.getAllCurLo = function(callback) {
    CurLo.find({}, {'_id':0, '__v':0}, callback);
}

// Get the CurLo *(limit 10 documents)
module.exports.getCurLoByEmpId = function(empid, callback) {
	CurLo.findOne({'curloid_from_empid': empid}, callback);
}

// Add new CurLo
module.exports.addCurLo = function(curlo, callback) {
	CurLo.create(curlo, callback);
}

// Update Timestamp after insert new CurLo
module.exports.updateTimestamp = function(empid, options, callback) {
	var query = {'curloid_from_empid': empid};
	CurLo.findOneAndUpdate(query, {'timestamp': new Date()}, options , callback);
}

// Update CurLo by emp_id
module.exports.updateCurLoByEmpId = function(empid, curlo, options, callback) {
	var query = {'curloid_from_empid': empid};
	CurLo.findOneAndUpdate(query, { $push: curlo }, options, callback);
}

// Update CurLo by emp_id
module.exports.updateCurLoByCurLoId = function(empid, curlo, options, callback) {
	var query = {'curloid_from_empid': empid};
	CurLo.findOneAndUpdate(query, { $push: curlo }, options, callback);
}

// Delete CurLo
module.exports.removeCurLo = function(empid, callback) {
	CurLo.remove({'curloid_from_empid': empid}, callback);
}


///////////////////////////////////////////////////////////////////////////////////

// Get latest array of location by emp_id
module.exports.getLatestLocationByEmpId = function(empid, callback) {
	CurLo.aggregate(  
			{ $match: {'curloid_from_empid': empid } }, 
		    { $project: {
		        count: { $size: '$location' },
		        latest: { 
		            $let: {
		                vars: { 
		                    count: { $size: '$location' } 
		                },
		                in: { $arrayElemAt: [ '$location', { $add: [ "$$count", -1 ] } ] } }
		            }
		        } 
		    }
		, callback);
}
///////////////////////////////////////////////////////////////////////////////////


//-------------------------- data example---------------------------
// /* 1 */
// {
//     "_id" : ObjectId("59086c9b26c26f0f2d47755c"),
//     "curloid_from_empid" : "1",
//     "location" : [ 
//         {
//             "_id" : ObjectId("591b51b352e829d4b705c72a"),
//             "position" : {
//                 "lng" : "-122.406417",
//                 "lat" : "37.785834"
//             }
//         }, 
//         {
//             "_id" : ObjectId("591b51fb52e829d4b705c731"),
//             "position" : {
//                 "lng" : "-122.406417",
//                 "lat" : "37.785834"
//             }
//         }, 
//         {
//             "_id" : ObjectId("591f1210af435067bcc5fda1"),
//             "position" : {
//                 "lng" : "100.5661460185921",
//                 "lat" : "13.74978504125306"
//             }
//         }, 
//         {
//             "_id" : ObjectId("591f2f60af435067bcc5fdbe"),
//             "position" : {
//                 "lng" : "100.5652397178102",
//                 "lat" : "13.74632136147902"
//             }
//         }, 
//         {
//             "_id" : ObjectId("591f31a9af435067bcc5fdc1"),
//             "position" : {
//                 "lng" : "100.565383834858",
//                 "lat" : "13.74622346834628"
//             }
//         }, 
//         {
//             "_id" : ObjectId("591f3209af435067bcc5fdc4"),
//             "position" : {
//                 "lng" : "100.565214771871",
//                 "lat" : "13.74658368063508"
//             }
//         }, 
//         {
//             "_id" : ObjectId("591f320caf435067bcc5fdc5"),
//             "position" : {
//                 "lng" : "100.5652337987912",
//                 "lat" : "13.74654068147181"
//             }
//         }, 
//         {
//             "_id" : ObjectId("591f47c4af435067bcc5fe02"),
//             "position" : {
//                 "lng" : "100.5654885255822",
//                 "lat" : "13.74211544989257"
//             }
//         }, 
//         {
//             "_id" : ObjectId("5925e3e0e828aafc31612a08"),
//             "position" : {
//                 "lng" : "-122.406417",
//                 "lat" : "37.785834"
//             }
//         }, 
//         {
//             "_id" : ObjectId("5925e3f6e828aafc31612a0a"),
//             "position" : {
//                 "lng" : "-122.406417",
//                 "lat" : "37.785834"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c45de1ca221a1bf1a6dfb"),
//             "position" : {
//                 "lng" : "100.5651481357408",
//                 "lat" : "13.74621131458669"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c46451ca221a1bf1a6dff"),
//             "position" : {
//                 "lng" : "100.5651015323592",
//                 "lat" : "13.74622418080805"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c464b1ca221a1bf1a6e00"),
//             "position" : {
//                 "lng" : "100.565278139059",
//                 "lat" : "13.74621898402809"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c464c1ca221a1bf1a6e01"),
//             "position" : {
//                 "lng" : "100.565278139059",
//                 "lat" : "13.74621898402809"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c464d1ca221a1bf1a6e02"),
//             "position" : {
//                 "lng" : "100.565278139059",
//                 "lat" : "13.74621898402809"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c4e671ca221a1bf1a6e2e"),
//             "position" : {
//                 "lng" : "100.5664153994576",
//                 "lat" : "13.74651373228847"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c69f11ca221a1bf1a6e40"),
//             "position" : {
//                 "lng" : "100.5652327929629",
//                 "lat" : "13.74630401843576"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c6dff1ca221a1bf1a6e48"),
//             "position" : {
//                 "lng" : "-122.406417",
//                 "lat" : "37.785834"
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c6e041ca221a1bf1a6e49"),
//             "position" : {
//                 "lng" : "-122.406417",
//                 "lat" : "37.785834"
//             }
//         }
//     ],
//     "__v" : 0,
//     "timestamp" : ISODate("2017-05-02T11:25:15.025Z")
// }