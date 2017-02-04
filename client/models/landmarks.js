var db = require('./connection.js');
counter = require('./counters');

//Landmarks Schema
const landmarkSchema = db.Mongoose.Schema({
        land_id: { type: String, index: { unique: true } },
        name: { type: String, required: true },
        lat: { type: String, required: true },
        lng: { type: String, required: true },
        addr: { type: String }
}, {collection:'Landmarks'});

//----------------------------------------------------------------------------
// for auto increment land_id 
//----------------------------------------------------------------------------

landmarkSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'land_id'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.land_id = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------


const Lan = module.exports =  db.Connection.model('Landmarks', landmarkSchema);

// Get all landmarks
module.exports.getAllLandmark = function( callback) {
        Lan.find({}, {'_id':0, '__v':0}, callback);
}

// Get landmark by ID
module.exports.getLandmarkById = function(landid, callback) {
        Lan.findOne({'land_id': landid}, {'_id':0, '__v':0}, callback);
}

// Get landmarks by name
module.exports.getLandmarkByName = function(landname, callback) {
        Lan.find({'name': new RegExp(landname)}, {'_id':0, '__v':0}, callback);
}

// Insert landmark
module.exports.addLandmark = function(landmark, callback) {
        Lan.create(landmark, callback);
}

// Update landmark
module.exports.updateLandmark = function(landid, landmark, options, callback) {
        var query = {'land_id': landid};
        Lan.findOneAndUpdate(query, landmark, options, callback);
}

// Delete landmark
module.exports.removeLandmark = function(landid, callback) {
        Lan.remove({'land_id': landid}, callback);
}

// /* 1 */
// {
//     "land_id" : "0001",
//     "name" : "Terminal 21",
//     "lat" : "13.7376599",
//     "lng" : "100.5582062",
//     "addr" : "sukhumvit19 bkk"
// }

// /* 2 */
// {
//     "land_id" : "0002",
//     "name" : "SWU",
//     "lat" : "13.7454649",
//     "lng" : "100.5631804",
//     "addr" : "sukhumvit23 bkk"
// }

// /* 3 */
// {
//     "land_id" : "0003",
//     "name" : "True tower",
//     "lat" : "13.762409",
//     "lng" : "100.5659413",
//     "addr" : "dindaeng bkk"
// }

// /* 4 */
// {
//     "land_id" : "0004",
//     "name" : "Siam Paragon",
//     "lat" : "13.7459332",
//     "lng" : "100.5325513",
//     "addr" : "patumwan bkk"
// }

// /* 5 */
// {
//     "land_id" : "0005",
//     "name" : "Bts onnut",
//     "lat" : "13.7055818",
//     "lng" : "100.5988887",
//     "addr" : "prakanong sukhumvit bkk"
// }