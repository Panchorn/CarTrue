var db = require('./connection.js');
counter = require('./counters');

//Landmarks Schema
const landmarkSchema = db.Mongoose.Schema({
        land_id: { type: String, index: { unique: true } },
        name: { type: String, required: true },
        lat: { type: String, required: true },
        lng: { type: String, required: true }
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
module.exports.getAllLandmark = function(callback) {
        Lan.find({}, {'_id':0, '__v':0}, callback).sort({name: 'asc'});
}

// Get landmark by ID
module.exports.getLandmarkById = function(landid, callback) {
        Lan.findOne({'land_id': landid}, {'_id':0, '__v':0}, callback);
}

// Get landmarks by name
module.exports.getLandmarkByName = function(landname, callback) {
        Lan.find({'name': new RegExp(landname, 'i')}, {'_id':0, '__v':0}, callback); // /bTs/i
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


//-------------------------- data example---------------------------
// /* 1 */
// {
//     "_id" : ObjectId("58bbde3cab3ca38ec4567ea5"),
//     "land_id" : "1",
//     "name" : "BTS Bearing",
//     "lat" : "13.661207",
//     "lng" : "100.601907"
// }

// /* 2 */
// {
//     "_id" : ObjectId("58bbde3cab3ca38ec4567ea6"),
//     "land_id" : "2",
//     "name" : "BTS Onnut",
//     "lat" : "13.7055818",
//     "lng" : "100.5988887"
// }

// /* 3 */
// {
//     "_id" : ObjectId("58bbdfdfab3ca38ec4567ea7"),
//     "land_id" : "3",
//     "name" : "BTS Siam",
//     "lat" : "13.745516",
//     "lng" : "100.534604"
// }

// /* 4 */
// {
//     "_id" : ObjectId("58bbdfdfab3ca38ec4567ea8"),
//     "land_id" : "4",
//     "name" : "BTS Bang Wa",
//     "lat" : "13.720698",
//     "lng" : "100.457804"
// }

// /* 5 */
// {
//     "_id" : ObjectId("58bbdfdfab3ca38ec4567ea9"),
//     "land_id" : "5",
//     "name" : "BTS  Victory Monument",
//     "lat" : "13.762758",
//     "lng" : "100.537084"
// }