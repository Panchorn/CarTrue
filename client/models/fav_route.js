var db = require('./connection.js');
counter = require('./counters');

//Fav_Route Schema
const favRouteSchema = db.Mongoose.Schema({ 
	// favroute_id: { type: String, index: { unique: true } },
	favrouteid_from_empid: { type: String, index: { unique: true } },
	driver_mode: [ 
		{
			route: {
				route_name: { type: String, index: { unique: true }, required: true },
				from: {
					name: { type: String, required: true },
			        lat: { type: String, required: true },
			        lng: { type: String, required: true }
				},
				to: {
					name: { type: String, required: true },
			        lat: { type: String, required: true },
			        lng: { type: String, required: true }
				},
				direction:{ type: String, required: true },
				seat: { type: Number, required: true, enum: ["1","2","3"] },
				time: { type: Date, default: Date.now },
				note: { type: String },
				rules: {
					maleAllow: { type: Boolean, default: true },
					femaleAllow: { type: Boolean, default: true },
					foodAllow: { type: Boolean, default: false },
					petAllow: { type: Boolean, default: false },
					babyAllow: { type: Boolean, default: false },
					smokeAllow: { type: Boolean, default: false }
				}
			}
		}
	],
	passenger_mode: [ 
		{
			route: {
				route_name: { type: String, index: { unique: true }, required: true },
				from: {
					name: { type: String, required: true },
			        lat: { type: String, required: true },
			        lng: { type: String, required: true }
				},
				to: {
					name: { type: String, required: true },
			        lat: { type: String, required: true },
			        lng: { type: String, required: true }
				},
				time: { type: Date, default: Date.now },
				note: { type: String }
			}
		}
	]
}, {collection:'Fav_Route'});

//----------------------------------------------------------------------------
// for auto increment favrouteid_from_empid 
//----------------------------------------------------------------------------

favRouteSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'favrouteid_from_empid'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.favrouteid_from_empid = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------

const FavRoute = module.exports =  db.Connection.model('Fav_Route', favRouteSchema);

// Get all Fav_Route
module.exports.getAllFavRoute = function(callback, limit) {
	FavRoute.find({}, {'_id':0, '__v':0}, callback).limit(limit);
}

// Get Fav_Route by emp_id
module.exports.getFavRouteByEmpId = function(empid, callback) {
	FavRoute.findOne({'favrouteid_from_empid': empid}, {'_id':0, '__v':0}, callback);
}

// Add Fav_Route
module.exports.addFavRoute = function(favroute, callback) {
	FavRoute.create(favroute, callback);
}

// Update more Fav_Route
module.exports.updateMoreFavRoute = function(empid, favroute, options, callback) {
	var query = {'favrouteid_from_empid': empid};
	console.log(favroute);
	FavRoute.findOneAndUpdate(query, { $push: favroute }, options, callback);
}

// Remove some Fav_Route in array
module.exports.removeSomeFavRoute = function(empid, mode, _id, options, callback) {
	var query = {'favrouteid_from_empid': empid};
	if (mode == 'driver_mode') {
		FavRoute.findOneAndUpdate(query, { $pull: { 'driver_mode': { '_id': _id } } }, options, callback);
	}
	else if (mode == 'passenger_mode') {
		FavRoute.findOneAndUpdate(query, { $pull: { 'passenger_mode': { '_id': _id } } }, options, callback);
	}
}

// Delete Fa_Route
module.exports.removeFavRoute = function(empid, callback) {
	FavRoute.remove({'favrouteid_from_empid': empid}, callback);
}
