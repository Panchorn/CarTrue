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
				// time: { type: Date, default: Date.now },
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
				// time: { type: Date, default: Date.now },
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


//-------------------------- data example---------------------------
// /* 1 */
// {
//     "_id" : ObjectId("5908b048f9e49d04f9e9a968"),
//     "favrouteid_from_empid" : "1",
//     "passenger_mode" : [],
//     "driver_mode" : [ 
//         {
//             "_id" : ObjectId("591d15b6cb6a5709fe627b2f"),
//             "route" : {
//                 "direction" : "syvrActcdRi@sAu@iBm@sAqBoERMFHRb@`BlDn@xATh@JFNLd@RTDhAChGk@bAQ^G`@Gn@Cv@YbAe@xAw@jB{A`Ay@x@y@PMHO|@gAb@}@Pg@\\kAVmANyADeBC{AQoEDmBJiBRaBxAoFNi@`AgDZ_ATs@hDmLJm@NmB?oAGqAAQs@gDa@cAs@uAiAeBkCsDqDwGoA_D_@y@Sa@wAcDqE{JwCqGkBmEu@oBs@eDs@eFsAoHqCwKWsA_@aDIy@W}C[cEKaDCyCGeG@}EPiP@iIFsK@uCTcFNiC\\mDnAeI@c@F]bBcKzBmOtAkIrAcHLeABo@Es@Ow@U}A_@cBAKQGSEo@AUBqAXcCb@cANoJxA_BRqEd@_DRyCHWB]ROBO@mAAqABiCHeDB{B@gCI}@@]MsBIwDS}BO}C[{AYoBc@oGkA_E{@mB[gEaAoCm@uF_AaD]UCgF]{Ha@yDSeD[}CWaD_@wCe@_FmAuBm@wCcAiBo@qD}@wCi@qB_@eDe@qGq@cEk@o@KyBg@yA[mF_BiGgB}Cy@q@SeBm@uBo@iCw@uJwC{GsBuMyDcEmAaJeD{@]y@c@o@a@o@{@Ug@Ms@GaABm@L{@^cAl@eAnByCTe@Rm@L[pBgEl@uApB}En@wA^k@x@uARa@h@}@|@iAlAmAhBoA|AcAp@]dAi@pA{@|@s@t@y@bBwBh@_Al@sABI@Gh@gBzA_ETi@dAcB\\c@hBmBt@q@~GuFjB}ArE}Dd@q@v@w@r@cA\\k@j@sA|@oDHUJY^k@RORI^Ix@Cn@Dd@TRNX^Rf@DX@XCh@Bb@[pBCNoBtLMdAo@fEQ`ASf@Ud@IH]`@i@\\k@Ra@F_@Bo@CsA[uAu@aEgEaA_AIS{@w@}CgC{A_AsC}AiC_A_@KaBg@qM{DkCmAuBgA}A{@}EcCqFyB_@OuAm@_Ac@i@_@{Ao@gB{@oBy@uAg@sAg@uDeBmEuBqEmBqEuBuCeB}Ay@kB{@}IeEo@]yBeAaFkCaD_BoEeBqDcBkCiAyAa@_B[aAOmASQE_AQm@EsAGa@Cg@C}DFkQbAcCJgCNwG^cEVwAFwVbAq@DuF\\eGRwDRu@Fg@Da@^u@CaA?q@DY@s@JaAJc@B]RsBDg@DwF^iAHe@HMFGHEJJPFFLTnAb@b@Px@`@fAh@hBx@lAn@p@~@hIbE~IlEnGvCpG~C",
//                 "seat" : 3,
//                 "route_name" : "1",
//                 "note" : "-",
//                 "rules" : {
//                     "smokeAllow" : false,
//                     "babyAllow" : false,
//                     "petAllow" : false,
//                     "foodAllow" : false,
//                     "femaleAllow" : true,
//                     "maleAllow" : true
//                 },
//                 "to" : {
//                     "lng" : "100.55375",
//                     "name" : "BTS Mo Chit",
//                     "lat" : "13.802439"
//                 },
//                 "from" : {
//                     "lng" : "100.457804",
//                     "name" : "BTS Bang Wa",
//                     "lat" : "13.720698"
//                 }
//             }
//         }, 
//         {
//             "_id" : ObjectId("591d15c1cb6a5709fe627b30"),
//             "route" : {
//                 "direction" : "syvrActcdRi@sAu@iBm@sAqBoERMFHRb@`BlDn@xATh@JFNLd@RTDhAChGk@bAQ^G`@Gn@Cv@YbAe@xAw@jB{A`Ay@x@y@PMHO|@gAb@}@Pg@\\kAVmANyADeBC{AQoEDmBJiBRaBxAoFNi@`AgDZ_ATs@hDmLJm@NmB?oAGqAAQs@gDa@cAs@uAiAeBkCsDqDwGoA_D_@y@Sa@wAcDqE{JwCqGkBmEu@oBs@eDs@eFsAoHqCwKWsA_@aDIy@W}C[cEKaDCyCGeG@}EPiP@iIFsK@uCTcFNiC\\mDnAeI@c@F]bBcKzBmOtAkIrAcHLeABo@Es@Ow@U}A_@cBAKQGSEo@AUBqAXcCb@cANoJxA_BRqEd@_DRyCHWB]ROBO@mAAqABiCHeDB{B@gCI}@@]MsBIwDS}BO}C[{AYoBc@oGkA_E{@mB[gEaAoCm@uF_AaD]UCgF]{Ha@yDSeD[}CWaD_@wCe@_FmAuBm@wCcAiBo@qD}@wCi@qB_@eDe@qGq@cEk@o@KyBg@yA[mF_BiGgB}Cy@q@SeBm@uBo@iCw@uJwC{GsBuMyDcEmAaJeD{@]y@c@o@a@o@{@Ug@Ms@GaABm@L{@^cAl@eAnByCTe@Rm@L[pBgEl@uApB}En@wA^k@x@uARa@h@}@|@iAlAmAhBoA|AcAp@]dAi@pA{@|@s@t@y@bBwBh@_Al@sABI@Gh@gBzA_ETi@dAcB\\c@hBmBt@q@~GuFjB}ArE}Dd@q@v@w@r@cA\\k@j@sA|@oDHUJY^k@RORI^Ix@Cn@Dd@TRNX^Rf@DX@XCh@Bb@[pBCNoBtLMdAo@fEQ`ASf@Ud@IH]`@i@\\k@Ra@F_@Bo@CsA[uAu@aEgEaA_AIS{@w@}CgC{A_AsC}AiC_A_@KaBg@qM{DkCmAuBgA}A{@}EcCqFyB_@OuAm@_Ac@i@_@{Ao@gB{@oBy@uAg@sAg@uDeBmEuBqEmBqEuBuCeB}Ay@kB{@}IeEo@]yBeAaFkCaD_BoEeBqDcBkCiAyAa@_B[aAOmASQE_AQm@EsAGa@Cg@C}DFkQbAcCJgCNwG^cEVwAFwVbAq@DuF\\eGRwDRu@Fg@Da@^u@CaA?q@DY@s@JaAJc@B]RsBDg@DwF^iAHe@HMFGHEJJPFFLTnAb@b@Px@`@fAh@hBx@lAn@p@~@hIbE~IlEnGvCpG~C",
//                 "seat" : 2,
//                 "route_name" : "2",
//                 "note" : "-",
//                 "rules" : {
//                     "smokeAllow" : false,
//                     "babyAllow" : false,
//                     "petAllow" : false,
//                     "foodAllow" : false,
//                     "femaleAllow" : true,
//                     "maleAllow" : true
//                 },
//                 "to" : {
//                     "lng" : "100.55375",
//                     "name" : "BTS Mo Chit",
//                     "lat" : "13.802439"
//                 },
//                 "from" : {
//                     "lng" : "100.457804",
//                     "name" : "BTS Bang Wa",
//                     "lat" : "13.720698"
//                 }
//             }
//         }, 
//         {
//             "_id" : ObjectId("592c45481ca221a1bf1a6df7"),
//             "route" : {
//                 "direction" : "{t{rAmcxdRqK{AmDg@SCUBm@IGAm@IiDc@mIgA}Fy@aC[sAQ{@WcCWe@IkDg@YA?WNwDDkAJiBRkHR_Gy@M{Cc@g@EqBKi@E{@CuCGeBGIpBIdAc@bE?NDLDB`ALJDBJ?LHJ@RE\\_@rBABv@NtCb@",
//                 "seat" : 3,
//                 "route_name" : "Home",
//                 "note" : "มาเร็วๆ",
//                 "rules" : {
//                     "smokeAllow" : false,
//                     "babyAllow" : false,
//                     "petAllow" : false,
//                     "foodAllow" : false,
//                     "femaleAllow" : false,
//                     "maleAllow" : true
//                 },
//                 "to" : {
//                     "lng" : "100.566164",
//                     "name" : "Central Rama 9",
//                     "lat" : "13.758439"
//                 },
//                 "from" : {
//                     "lng" : "100.5631804",
//                     "name" : "Srinakharinwirot University",
//                     "lat" : "13.7454649"
//                 }
//             }
//         }
//     ],
//     "__v" : 0
// }