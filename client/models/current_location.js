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