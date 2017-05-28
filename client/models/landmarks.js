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

// /* 1 */
// {
//     "_id" : ObjectId("5863eb401a616a22e8150912"),
//     "land_id" : "1",
//     "name" : "Terminal 21",
//     "lat" : "13.73762",
//     "lng" : "100.56038",
//     "addr" : "sukhumvit19 bkk",
//     "__v" : 0
// }

// /* 2 */
// {
//     "_id" : ObjectId("5863eb551a616a22e8150913"),
//     "land_id" : "2",
//     "name" : "SWU",
//     "lat" : "13.7454649",
//     "lng" : "100.5631804",
//     "addr" : "sukhumvit23 bkk",
//     "__v" : 0
// }

// /* 3 */
// {
//     "_id" : ObjectId("5863eb5e1a616a22e8150914"),
//     "land_id" : "3",
//     "name" : "True tower",
//     "lat" : "13.7624",
//     "lng" : "100.56813",
//     "addr" : "dindaeng bkk",
//     "__v" : 0
// }

// /* 4 */
// {
//     "_id" : ObjectId("5863eb681a616a22e8150915"),
//     "land_id" : "4",
//     "name" : "Siam Paragon",
//     "lat" : "13.74576",
//     "lng" : "100.53419",
//     "addr" : "patumwan bkk",
//     "__v" : 0
// }

// /* 5 */
// {
//     "_id" : ObjectId("5863eb721a616a22e8150916"),
//     "land_id" : "5",
//     "name" : "Bts onnut",
//     "lat" : "13.70562",
//     "lng" : "100.60099",
//     "addr" : "prakanong sukhumvit bkk",
//     "__v" : 0
// }