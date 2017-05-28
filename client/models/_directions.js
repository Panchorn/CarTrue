const mongoose = require('mongoose');

//Directions Schema
const directionSchema = mongoose.Schema({
	// direction_id: { type: String },
	geocoded_waypoints: { type: Array },
	routes: { type: Array },
	status: { type: String }
}, {collection:'Directions'});


//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------


const Dir = module.exports =  mongoose.model('Directions', directionSchema);

// Get all the directions
module.exports.getAllDirection = function(callback) {
	Dir.find({}, {'__v':0}, callback);
}

// Get the directions by direction_id
module.exports.getDirectionById = function(directionid, callback) {
    // Dir.findOne({'direction_id': directionid}, {'_id':0, '__v':0}, callback);
    Dir.findOne({'_id': mongoose.Types.ObjectId(directionid)}, {'__v':0}, callback); // EDIT
}

// Insert the direction
module.exports.addDirection = function(direction, callback) {
	Dir.create(direction, callback);
}

// Delete the direction
module.exports.removeDirection = function(directionid, callback) {
    Dir.remove({'direction_id': directionid}, callback);
}

// count length of directions collection
module.exports.countDirection = function(callback) {
    Dir.count({}, callback);}

// Search direction
module.exports.searchDirection = function(direction, callback) {
	var match = false;

	// data from client
	var client_steps_latlng = [];
	const client_legs = direction.routes[0].legs[0];
	var i = 0;

	// data from database
	var j = 0,
		k = 0,
		l = 0;

	// console.log(_legs.steps.length);
	while (i < client_legs.steps.length) {
		// get lat,lng from client
		client_steps_latlng.push(client_legs.steps[i].start_location.lat 
							+ ',' + client_legs.steps[i].start_location.lng);
		console.log('FROM CLIENT = ' + i + ' : ' + client_steps_latlng[i]);


		// last loop
		// do loop for get lat,lng from database 
		if (i == client_legs.steps.length-1){
			// console.log('last loop : ' + i);

			// count length of this collection
			Dir.countDirection(function(err, length){

				// get legs from each document
				Dir.find({}, {'__v':0, 'status':0, 'geocoded_waypoints':0})
					.lean().exec(function (err, results) {
				
					// console.log(length);
					while (j < length && match !== true) {
						// console.log(results[j].direction_id);
						// console.log(j);
						// console.log('---------: ' + results[j].routes[0].legs[0].end_address);

						// get lat,lng from database
						var database_steps_latlng = [];
						const database_legs = results[j].routes[0].legs[0];

						// console.log('=1 : ' + database_legs.steps.length);

						// do loop of steps in each collection
						while (k < database_legs.steps.length) {
							database_steps_latlng.push(database_legs.steps[k].start_location.lat 
												+ ',' + database_legs.steps[k].start_location.lng);

							console.log('FROM DATABASE ' + j + ' = ' + k + ' : ' + database_steps_latlng[k]);

							// last loop
							if (l == database_legs.steps.length-1) {
								// console.log(database_steps_latlng.toString());
								// console.log(client_steps_latlng.toString());

								// check match
								if (database_steps_latlng.toString() === client_steps_latlng.toString()) {
									match = true;
									console.log('true');
									callback(results[j]._id);
								}
								else if (j == length-1) {
									// insert new direction when check done 
									Dir.addDirection(direction, function(err, data) {
						                if (err) { console.error(err); res.send(err.toString()); }
						                else { console.log('Added direction : ' + data._id); 
											callback(data._id);
						                }
						            });
								}
								else {									
									console.log('false');
								}
								database_steps_latlng = [];
							}
							l++;
							k++;
						}
						k = 0;
						l = 0;
						j++;
					}
				});
			});
		}
		i++;
	}
}