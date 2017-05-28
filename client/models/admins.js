var db = require('./connection.js');
counter = require('./counters');

//Admin Schema
const adminSchema = db.Mongoose.Schema({ 
	adm_id:{ type: String, index: { unique: true } },
	username:{ type: String, required: true, index: { unique: true } },
	email:{ type: String, required: true, index: { unique: true } },
	password:{ type: String, required: true },	
	status:{ type: String, required: true, enum: ["superadmin","admin"] }
}, {collection:'Admins'});

//----------------------------------------------------------------------------
// for auto increment adm_id 
//----------------------------------------------------------------------------

adminSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'adm_id'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.adm_id = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------

const Adm = module.exports =  db.Connection.model('Admins', adminSchema);

// Get all Admin
module.exports.getAdms = function(callback, limit) {
	Adm.find({}, {'_id':0, '__v':0}, callback).limit(limit);
}

// Get Admin by ID
module.exports.getAdmById = function(admid, callback) {
	Adm.findOne({'adm_id': admid}, {'_id':0, '__v':0}, callback);
}

// Get Admin by username
module.exports.getAdmByUserame = function(username, callback) {
	Adm.findOne({'username': username}, {'_id':0, '__v':0}, callback);
}

// Add Admin
module.exports.addAdm = function(adm, callback) {
	Adm.create(adm, callback);
}

// Update Admin
module.exports.updateAdm = function(admid, adm, options, callback) {
	console.log(admid)
	console.log(adm)
	var query = {'adm_id': admid};
	Adm.findOneAndUpdate(query, adm, options, callback);
}

// Delete Admin
module.exports.removeAdm = function(admid, callback) {
	Adm.remove({'adm_id': admid}, callback);
}

// for authen
module.exports.authenAdm = function(adm, callback) {
	Adm.findOne({'username': adm.username, 
		'password': adm.password}, 
		{'_id':0, '__v':0, 'employee.password':0}, function(err, result){
        if (err) { 
            console.error('Authentication fail');
            callback('Authentication fail');
        }
        else if (result === null) {        	
            console.log('No admin data');
            callback(null);
        }
        else { 
            console.log('Authentication success');
            callback(result);
        }
    });
}