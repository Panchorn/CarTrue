var db = require('./connection.js');
counter = require('./counters');

//Routes Schema
const routeSchema = db.Mongoose.Schema({ 
	route_id:{ type: String, index: { unique: true } },
	driver_id:{ type: String, required: true },
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
		start:{ type: Date, required: true },
		arrived:{ type: Date }
	},
	seat:{ type: String, required: true, enum: ["1","2","3"] },
	current_seat:{ type: String, enum: ["empty","remain","full"], default: "empty" },
	direction:{ type: String, required: true },
	note: { type: String },
	route_status: { 
		type: String, 
		enum: ["ready", "please_wait","in_travel", "arrived", "cancel"], 
		default: "please_wait" },
	timestamp:{ type: Date, default: Date.now }
}, {collection:'Routes'});

//----------------------------------------------------------------------------
// for auto increment route_id 
//----------------------------------------------------------------------------

routeSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'route_id'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.route_id = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------

const Rou = module.exports =  db.Connection.model('Routes', routeSchema);

// Get the Routes *(limit 10 documents)
module.exports.getRouteByDriverId = function(driverid, callback) {
	Rou.find({'driver_id': driverid}, 
				{'_id':0,'route_id':1, 'date':1, 'origin':1, 'destination':1}, 
				callback)//.limit(10);
}

// Get more detail of each Route
module.exports.getRouteByRouteId = function(routeid, callback) {
	Rou.findOne({'route_id': routeid}, {'_id':0, '__v':0}, callback);
}

// Get to show in history (for driver)
module.exports.getRouteForHistoryD = function(driverid, callback) {
	Rou.find({'route_status': 'arrived', 'driver_id': driverid}, {'_id': 0, '__v': 0}, 
				callback);
	// Rou.find({$or: [{'route_status': 'arrived'}, {'route_status': 'cancel'}], 
	// 			'driver_id': driverid}, 
	// 			{'_id': 0, '__v': 0}, 
	// 			callback);
}

// Add new Route
module.exports.addRoute = function(route, callback) {
	Rou.create(route, callback);
}

// Update Route
module.exports.updateRoute = function(routeid, route, options, callback) {
	var query = {'route_id': routeid};
	Rou.findOneAndUpdate(query, route, options, callback);
}

// Delete Route
module.exports.removeRoute = function(routeid, callback) {
	Rou.remove({'route_id': routeid}, callback);
}

//----------------------------------------------------------------------------
// for call from matching.js
//----------------------------------------------------------------------------

// Get the Routes
module.exports.getRouteToMatch = function(origin, destination, callback) {
	Rou.find({
		'route_status': 'ready', 
		'origin.name': origin, 
		'destination.name': destination, 
		'current_seat': {$ne: 'full'}
	}, {'__v':0}, callback);
}




//-------------------------- data example---------------------------
// /* 1 */
// {
//     "_id" : ObjectId("585d4296f892e05f7ede6085"),
//     "route_id" : "1",
//     "driver_id" : "1",
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
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "full",
//     "direction" : "yzsrAue_eRs@LTx@f@vAgNvFiBh@i@@s@A_AQuEsC[SUMMIyLyGkAs@_FsCoBcAyDqBk@WmBcAw@_@aHoCeCkAS[WKyAk@yB{@mJwD}@a@sBk@_B[yAO{@EiAAiDHsQlAcIj@eBDcRZeED{ALwAFeDF}AAcBGo@EsDa@aBQ]CMDUJMHEPK\\_@hA{BrJGTEJMVW^uA|AMNa@r@Kj@OhAqAlJsCjSk@lEI~@aA|GWrBy@xGQ|@g@jDW~By@~Fw@lFYtBMp@iBfM_AvGyAvKkC~Qe@jDYhB[jBg@hDs@tF_AfHKx@]lDYvDe@bHWdDElBYrEQnBGjANf@JLZVbEj@lEn@bGx@\\DVmB",
//     "note" : "hurry up!",
//     "route_status" : "arrived"
// }

// /* 2 */
// {
//     "_id" : ObjectId("585d446ff892e05f7ede6086"),
//     "route_id" : "2",
//     "driver_id" : "1",
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
//         "start" : ISODate("2016-12-22T08:30:00.000Z"),
//         "arrived" : ISODate("2016-12-22T09:30:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "ew{rAogrdRDc@NUX{Cr@wHP{ACYDc@Fq@B[`@cEh@wFd@oEN{ABQYIw@K{BSqAK_KaAiCUoD[_AIQ?O?DYDa@R}BZqEBa@@QJQD]BUF]BQFo@FgA@iACaAMsECmBS_GMmGCYCs@CyAMiIM}FIoBAg@AsBJuB`@cHd@_Ih@aJLuBI_@L{BXkE\\uE?GL@H@l@HPLRB~Cb@`ANhEl@pC^bAN\\DVmB",
//     "note" : "so hungry!!!",
//     "route_status" : "arrived"
// }

// /* 3 */
// {
//     "_id" : ObjectId("585d455bf892e05f7ede6087"),
//     "route_id" : "3",
//     "driver_id" : "3",
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
//         "start" : ISODate("2016-12-13T09:30:00.000Z"),
//         "arrived" : ISODate("2016-12-13T11:00:00.000Z")
//     },
//     "seat" : "2",
//     "current_seat" : "remain",
//     "direction" : "~rAcxxdRF]d@_CLYJKuMqJo@e@FKFKTNbBnAbAt@fE|CxDjCpCrApAl@`ATtAZr@P`Dj@rDf@jANtC`@ZDb@EXQBIFSBg@DkABu@FcAFwALsEZuIRkGDcCReFBsAFeGHyB@mBF{BRyFTeKTkCAg@@e@KyA@e@?o@H_A^mCr@qEL}@`AqFPeAhAyE`AiEb@kBr@mDNs@?YH_AhA_F^uBXuADURaBh@cDJm@P_A@m@K_@Uc@a@a@y@eAeAgBqAwD{@wB_AoBk@w@g@a@UMg@UkACg@DgAVg@Vc@d@Wf@Ox@?D?JDZVj@VX`@NVDXAv@Ql@_@VIXMp@k@r@w@`@c@h@o@l@_AfAkBrBoErAeChDgHl@kArBiDlAyAp@q@bBsAdB{@|@YdAWr@Mb@E|AKxDMbWk@x@BfEb@zIzALBp@Lb@HtEd@pCNzADnDArEC|IGfEAbDGhBE|AI|QsAtIk@rAG`B@rBFjAJx@PpCv@`GdChLtEjNzFhChAjCrA`H`EhDpBx@f@dB|@~C`Bn@LzAp@\\RXNbE~Bf@Rz@Rp@HjA?v@KtE_BpEoBl@WOa@[aAGY`@IPC",
//     "note" : "i have a class",
//     "route_status" : "arrived"
// }

// /* 4 */
// {
//     "_id" : ObjectId("585d4645f892e05f7ede6088"),
//     "route_id" : "4",
//     "driver_id" : "2",
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
//         "start" : ISODate("2016-12-16T09:00:00.000Z"),
//         "arrived" : ISODate("2016-12-16T09:30:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "qczrAwfwdRcASgA_@KEU^k@|@sBfDy@pAq@dASXGEKGd@s@tAwBxBiDxBkDnDwFlAmB|AgClCoEr@eAoM{@yD[aHg@}CUqFe@kAMgDc@eBWY[_CYm@`F",
//     "note" : "where are you",
//     "route_status" : "arrived"
// }

// /* 5 */
// {
//     "_id" : ObjectId("5864ba0eaddfc6455a9bfbaa"),
//     "route_id" : "5",
//     "driver_id" : "1",
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
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "empty",
//     "direction" : "yzsrAue_eRs@LTx@f@vAgNvFiBh@i@@s@A_AQuEsC[SUMMIyLyGkAs@_FsCoBcAyDqBk@WmBcAw@_@aHoCeCkAS[WKyAk@yB{@mJwD}@a@sBk@_B[yAO{@EiAAiDHsQlAcIj@eBDcRZeED{ALwAFeDF}AAcBGo@EsDa@aBQ]CMDUJMHEPK\\_@hA{BrJGTEJMVW^uA|AMNa@r@Kj@OhAqAlJsCjSk@lEI~@aA|GWrBy@xGQ|@g@jDW~By@~Fw@lFYtBMp@iBfM_AvGyAvKkC~Qe@jDYhB[jBg@hDs@tF_AfHKx@]lDYvDe@bHWdDElBYrEQnBGjANf@JLZVbEj@lEn@bGx@\\DVmB",
//     "note" : "Im on a bed",
//     "route_status" : "ready"
// }

// /* 6 */
// {
//     "_id" : ObjectId("5864bb2baddfc6455a9bfbab"),
//     "route_id" : "6",
//     "driver_id" : "3",
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
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "yzsrAue_eRs@LTx@f@vAgNvFiBh@i@@s@A_AQuEsC[SUMMIyLyGkAs@_FsCoBcAyDqBk@WmBcAw@_@aHoCeCkAS[WKyAk@yB{@mJwD}@a@sBk@_B[yAO{@EiAAiDHsQlAcIj@eBDcRZeED{ALwAFeDF}AAcBGo@EsDa@aBQ]CMDUJMHEPK\\_@hA{BrJGTEJMVW^uA|AMNa@r@Kj@OhAqAlJsCjSk@lEI~@aA|GWrBy@xGQ|@g@jDW~By@~Fw@lFYtBMp@iBfM_AvGyAvKkC~Qe@jDYhB[jBg@hDs@tF_AfHKx@]lDYvDe@bHWdDElBYrEQnBGjANf@JLZVbEj@lEn@bGx@\\DVmB",
//     "note" : "1111111",
//     "route_status" : "ready"
// }

// /* 7 */
// {
//     "_id" : ObjectId("5864bb4baddfc6455a9bfbac"),
//     "route_id" : "7",
//     "driver_id" : "5",
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
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "seat" : "3",
//     "current_seat" : "remain",
//     "direction" : "yzsrAue_eRs@LTx@f@vAgNvFiBh@i@@s@A_AQuEsC[SUMMIyLyGkAs@_FsCoBcAyDqBk@WmBcAw@_@aHoCeCkAS[WKyAk@yB{@mJwD}@a@sBk@_B[yAO{@EiAAiDHsQlAcIj@eBDcRZeED{ALwAFeDF}AAcBGo@EsDa@aBQ]CMDUJMHEPK\\_@hA{BrJGTEJMVW^uA|AMNa@r@Kj@OhAqAlJsCjSk@lEI~@aA|GWrBy@xGQ|@g@jDW~By@~Fw@lFYtBMp@iBfM_AvGyAvKkC~Qe@jDYhB[jBg@hDs@tF_AfHKx@]lDYvDe@bHWdDElBYrEQnBGjANf@JLZVbEj@lEn@bGx@\\DVmB",
//     "note" : "1111111",
//     "route_status" : "ready"
// }

// /* 8 */
// {
//     "_id" : ObjectId("5867699ef1436e233c9e3a98"),
//     "route_id" : "8",
//     "driver_id" : "5",
//     "seat" : "3",
//     "note" : "1111111",
//     "timestamp" : ISODate("2016-12-31T08:17:34.425Z"),
//     "route_status" : "cancel",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2016-12-12T16:30:00.000Z"),
//         "arrived" : ISODate("2016-12-12T17:50:00.000Z")
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "prakanong sukhumvit bkk"
//     },
//     "__v" : 0
// }

// /* 9 */
// {
//     "_id" : ObjectId("5880385bef62fd20a9f3d101"),
//     "route_id" : "9",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "yzsrAue_eRs@L[o@eAiCeAgCEIGBwAf@cC`AmCdAyAn@uBvAi@h@qBjCILQXOVwBdDU^uBnDi@v@eBjC]h@aDdFkC~DcFbIkFhI_AtA_BhCqDvFgQvX}BtD_HjKy@vAmAjB{CzEwMxSmKvP}A`CsAvBeDhFeIpMqBdDiA`Bs@dAgDpFgDhFuCnEkJ`OwAzBYd@JDfA^bAR",
//     "note" : "ให้ไวจ้าาาาา",
//     "timestamp" : ISODate("2017-01-19T03:54:03.828Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-01-19T10:53:00.000Z"),
//         "arrived" : ISODate("2017-01-19T10:53:00.000Z")
//     },
//     "destination" : {
//         "name" : "Terminal 21",
//         "lat" : "13.7376599",
//         "lng" : "100.5582062",
//         "addr" : "Terminal 21"
//     },
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "Bts onnut"
//     },
//     "__v" : 0
// }

// /* 10 */
// {
//     "_id" : ObjectId("588038b7ef62fd20a9f3d102"),
//     "route_id" : "10",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "ew{rAogrdRDc@NUX{Cr@wHP{ACYDc@Fq@B[`@cEh@wFd@oEN{ABQYIw@K{BSqAK_KaAiCUoD[_AIQ?O?DYDa@R}BZqEBa@@QJQD]BUF]BQFo@FgA@iACaAMsECmBS_GMmGCYCs@CyAMiIM}FIoBAg@g@cAUc@IIWEo@Kc@GiBWm@IQ@QOMIKY?c@nC}RfFw^@KOCa@G[E{HgAmC]eC]yBY{@Ww@IiBUsDi@_AG{Fs@_KuAuDaAa@KoAi@kAm@aAi@y@g@KJMXe@~BG\\",
//     "note" : "เรวดิสาส",
//     "timestamp" : ISODate("2017-01-19T03:55:35.319Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-01-19T01:55:00.000Z"),
//         "arrived" : ISODate("2017-01-19T01:55:00.000Z")
//     },
//     "destination" : {
//         "name" : "True tower",
//         "lat" : "13.762409",
//         "lng" : "100.5659413",
//         "addr" : "True tower"
//     },
//     "origin" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.7459332",
//         "lng" : "100.5325513",
//         "addr" : "Siam Paragon"
//     },
//     "__v" : 0
// }

// /* 11 */
// {
//     "_id" : ObjectId("58803a57ef62fd20a9f3d103"),
//     "route_id" : "11",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "cq{rAgfxdRWlB]EcAOqC_@iEm@aFs@SCUBm@IGAMA@IBa@F_AHcALgBXwEFuA^qFVqEVmDZ}Cl@}EZgB~@qHf@kDTiAPoApAaJvAeK~@aHfAoHnCsRx@gGt@gFfAiId@iDpAiJHo@b@cDj@kETiBxD{WtAsKR{@b@q@LO~AqBVe@FQjAeFhBeHtA}ELc@L@CJQn@K`@GV@VHVFLF@n@Jt@NzBVzAHv@BrHDdMCbAFfEAbDGhBEtAGx@GhKw@vNaArAG`B@rBFjAJx@PpCv@tAn@bLrEpMjFjEfBhChAjCrA`H`EpBhApBnAdB|@~C`Bn@LzAp@HDb@VHDbE~Bf@Rz@RXF~@Bb@Av@KtE_BpEoBl@WOa@[aAGY`@IPC",
//     "note" : "มาๆ",
//     "timestamp" : ISODate("2017-01-19T04:02:31.497Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-01-19T04:02:00.000Z"),
//         "arrived" : ISODate("2017-01-19T04:02:00.000Z")
//     },
//     "destination" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "Bts onnut"
//     },
//     "origin" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "SWU"
//     },
//     "__v" : 0
// }

// /* 12 */
// {
//     "_id" : ObjectId("5884ca460242444ed02f0937"),
//     "route_id" : "12",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "ew{rAogrdRDc@NUX{Cr@wHP{ACYDc@Fq@B[`@cEh@wFd@oEN{ABQYIw@K{BSqAK_KaAiCUoD[_AIQ?O?DYDa@R}BZqEBa@@QJQD]BUF]BQFo@FgA@iACaAMsECmBS_GMmGCYCs@CyAMiIM}FIoBAg@g@cAUc@IIWEo@Kc@GiBWm@IQ@QOMIKY?c@nC}RfFw^@KOCa@G[E{HgAmC]eC]yBY{@Ww@IiBUsDi@_AG{Fs@_KuAuDaAa@KoAi@kAm@aAi@y@g@KJMXe@~BG\\",
//     "note" : "บลาๆ",
//     "timestamp" : ISODate("2017-01-22T15:05:42.200Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-01-22T22:05:00.000Z"),
//         "arrived" : ISODate("2017-01-22T22:05:00.000Z")
//     },
//     "destination" : {
//         "name" : "True tower",
//         "lat" : "13.762409",
//         "lng" : "100.5659413",
//         "addr" : "True tower"
//     },
//     "origin" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.7459332",
//         "lng" : "100.5325513",
//         "addr" : "Siam Paragon"
//     },
//     "__v" : 0
// }

// /* 13 */
// {
//     "_id" : ObjectId("5884dde30242444ed02f0938"),
//     "route_id" : "13",
//     "driver_id" : "7",
//     "seat" : "2",
//     "direction" : "ew{rAogrdRDc@NUX{Cr@wHP{ACYDc@Fq@B[`@cEh@wFd@oEfAoLRcCVeC|@kJx@gJ\\sDJi@ToBBc@\\iDX}BB]?Cm@DeALyDRqEFw@?MEIGAA]BaBHiCPeERkADkF\\u@F}B^sAb@u@\\GBe@PeAh@q@f@cAbAgA`BWb@sAxBeAzA_@^kBzAw@^{An@QFa@HOHCBUNwB~@k@Zo@\\}@h@a@^]T}@l@q@Zs@L_@?c@Gg@Ok@_@MOYo@Qg@?w@D]Ro@PWZ[XU~C{B\\SbAq@`@Uv@q@X_@N[Hu@Em@Oy@Yq@_@u@[s@Me@E]?GCm@Hw@\\eAnAeC\\{@Vq@|@iBh@sAf@}AXsALg@PaATcB~C}Tl@aFb@uDZcCBqBhAoKLy@TcAb@iADe@Ki@EMYC_AMgAUy@OcAKuCc@sASYAoAMeGu@iEm@mC_@o@QOEkCo@{Ao@mCwASMe@YEDIL]nAY~A",
//     "note" : "ว่ิย",
//     "timestamp" : ISODate("2017-01-22T16:29:23.539Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-01-22T06:29:00.000Z"),
//         "arrived" : ISODate("2017-01-22T06:29:00.000Z")
//     },
//     "destination" : {
//         "name" : "True tower",
//         "lat" : "13.762409",
//         "lng" : "100.5659413",
//         "addr" : "True tower"
//     },
//     "origin" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.7459332",
//         "lng" : "100.5325513",
//         "addr" : "Siam Paragon"
//     },
//     "__v" : 0
// }

// /* 14 */
// {
//     "_id" : ObjectId("5889b0a20870213b42ee2fe9"),
//     "route_id" : "14",
//     "driver_id" : "7",
//     "seat" : "2",
//     "direction" : "ew{rAogrdRDc@NUX{Cr@wHP{ACYDc@Fq@B[`@cEh@wFd@oEN{ABQYIw@K{BSqAK_KaAiCUoD[_AIQ?O?DYDa@R}BZqEBa@@QJQD]BUF]BQFo@FgA@iACaAMsECmBS_GMmGCYCs@CyAMiIM}FIoBAg@g@cAUc@IIWEo@Kc@GiBWm@IQ@QOMIKY?c@nC}RfFw^@KOCa@G[E{HgAmC]eC]yBY{@Ww@IiBUsDi@_AG{Fs@_KuAuDaAa@KoAi@kAm@aAi@y@g@KJMXe@~BG\\",
//     "note" : "mama",
//     "timestamp" : ISODate("2017-01-26T08:17:38.365Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-01-26T18:17:00.000Z"),
//         "arrived" : ISODate("2017-01-26T18:17:00.000Z")
//     },
//     "destination" : {
//         "name" : "True tower",
//         "lat" : "13.762409",
//         "lng" : "100.5659413",
//         "addr" : "True tower"
//     },
//     "origin" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.7459332",
//         "lng" : "100.5325513",
//         "addr" : "Siam Paragon"
//     },
//     "__v" : 0
// }

// /* 15 */
// {
//     "_id" : ObjectId("588ec01166944c76388f8b93"),
//     "route_id" : "15",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "ew{rAogrdRDc@NUX{Cr@wHP{ACYDc@Fq@B[`@cEh@wFd@oEfAoLRcCVeC|@kJx@gJ\\sDJi@ToBBc@\\iDX}BB]?Cm@DeALyDRqEFw@?MEIGAA]BaBHiCPeERkADkF\\u@F}B^sAb@u@\\GBe@PeAh@q@f@cAbAgA`BWb@sAxBeAzA_@^kBzAw@^{An@QFa@HOHCBUNwB~@k@Zo@\\}@h@a@^]T}@l@q@Zs@L_@?c@Gg@Ok@_@MOYo@Qg@?w@D]Ro@PWZ[XU~C{B\\SbAq@`@Uv@q@X_@N[Hu@Em@Oy@Yq@_@u@[s@Me@E]?GCm@Hw@\\eAnAeC\\{@Vq@|@iBh@sAf@}AXsALg@PaATcB~C}Tl@aFb@uDdCiRf@wCToBLeANaBp@}I`AmGTeCFcADk@DiCEqE_@aGYoC}@qFQ{@uAsFaCwJ_@qAWuA_@mCOuBKgD@aCByAD}APsBDm@Hs@^wFZyDDm@LsAn@iCR{@l@mCFWZsAr@mDNs@?YH_AhA_F^uBXuADURaBh@cDJm@P_A@m@K_@Uc@a@a@y@eAeAgBqAwD{@wB_AoBk@w@g@a@UMg@UkACg@DgAVg@Vc@d@Wf@Ox@?D?JDZVj@VX`@NVDXAv@Ql@_@VIXMp@k@r@w@`@c@h@o@l@_AfAkBrBoErAeChDgHl@kArBiDlAyAp@q@bBsAdB{@|@YdAWr@Mb@E|AKxDMbWk@x@BfEb@zIzALBp@Lb@HtEd@pCNzADnDArEC|IGfEAbDGhBE|AI|QsAtIk@rAG`B@rBFjAJx@PpCv@`GdChLtEjNzFhChAjCrA`H`EhDpBx@f@dB|@~C`Bn@LzAp@\\RXNbE~Bf@Rz@Rp@HjA?v@KtE_BpEoBl@WOa@[aAGY`@IPC",
//     "note" : "",
//     "timestamp" : ISODate("2017-01-30T04:24:49.911Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-01-30T11:24:00.000Z"),
//         "arrived" : ISODate("2017-01-30T11:24:00.000Z")
//     },
//     "destination" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "Bts onnut"
//     },
//     "origin" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.7459332",
//         "lng" : "100.5325513",
//         "addr" : "Siam Paragon"
//     },
//     "__v" : 0
// }

// /* 16 */
// {
//     "_id" : ObjectId("58917eef66944c76388f8b94"),
//     "route_id" : "16",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "qczrAwfwdRcASgA_@KEU^k@|@sBfDy@pAq@dASXGEKGd@s@tAwBxBiDxBkDnDwFlAmB|AgCP[zBZtAPp@JnAd@vBjAfBdA\\NzA`@ZFfAD~C?dHO~BKzRsA`GObDHn@BjAJnBd@~GjBlFnAdAX~@XxHlBxA^j@RNFp@f@jElEr@h@~@z@HJHHNDFBVXlDpDbEpDc@d@QFINODwPp@_H\\mAH_Fb@KJI`@Eb@}GXS@[HWH_AZSHU@k@@m@@EGAMB_@n@MDCFIr@EfAGnDShEQbCSd@Oz@e@fA}@b@e@z@oAdBkCJKlDqHJWj@sATa@n@y@~B_DvIgMjBmCpDoFZm@f@aBNu@D_@Bi@BgBCy@QmBoB{NWmB]kB_@{BKq@qBoN]mFAgBHkALs@TeA`AsDf@_BrDqLnByFVy@Le@nBaGh@wA\\cAj@uAvAwCpJcSpAkBl@m@tAyAX[~BcBlBcAlAe@vAg@~G{BrDmApA_APYDMBc@CQQSm@W[ESFYVOr@QbBGPKJoBr@i@}Au@yBoB_Je@}Bu@aDc@_CwAoGGo@UwAKm@s@wB_@eA[aAGY`@IPC",
//     "note" : "มามะะะ",
//     "timestamp" : ISODate("2017-02-01T06:23:43.001Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-02-01T18:40:00.000Z"),
//         "arrived" : ISODate("2017-02-01T18:40:00.000Z")
//     },
//     "destination" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "Bts onnut"
//     },
//     "origin" : {
//         "name" : "Terminal 21",
//         "lat" : "13.7376599",
//         "lng" : "100.5582062",
//         "addr" : "Terminal 21"
//     },
//     "__v" : 0
// }

// /* 17 */
// {
//     "_id" : ObjectId("58917f9266944c76388f8b95"),
//     "route_id" : "17",
//     "driver_id" : "6",
//     "seat" : "3",
//     "direction" : "ew{rAogrdRDc@NUX{Cr@wHP{ACYDc@Fq@B[`@cEh@wFd@oEfAoLRcCVeC|@kJx@gJ\\sDJi@ToBBc@\\iDX}BDi@ZaCTwBR{Ad@wBZmA^eAf@iAv@qAn@eA~BuDhCcEbIgM~IqNtA_CvBgDFIcAG{Hg@mFc@oCQiHk@cGg@qFo@cAOs@KQSGG_CYm@`F",
//     "note" : "มาๆๆๆเร๋วๆๆๆ",
//     "timestamp" : ISODate("2017-02-01T06:26:26.054Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-02-01T05:26:00.000Z"),
//         "arrived" : ISODate("2017-02-01T05:26:00.000Z")
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "SWU"
//     },
//     "origin" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.7459332",
//         "lng" : "100.5325513",
//         "addr" : "Siam Paragon"
//     },
//     "__v" : 0
// }

// /* 18 */
// {
//     "_id" : ObjectId("58918fa666944c76388f8b96"),
//     "route_id" : "18",
//     "driver_id" : "6",
//     "seat" : "2",
//     "direction" : "yzsrAue_eRs@L[o@eAiCeAgCEIGBwAf@cC`AmCdAyAn@uBvAi@h@qBjCILQXOVwBdDU^uBnDi@v@eBjC]h@aDdFkC~DcFbIkFhI_AtA_BhCqDvFgQvX}BrD_HlKy@vAmAjB{CzEwMxSmKvP}A`CsAvBeDhFeIpMqBdDc@YcBWoFs@yDi@cEk@m@CoBOUCAHOfBa@@cBCoFg@oCYgFm@{AS[jBGFiAOcDm@a@fBY~Ak@lDa@xCKZ_CYm@`F",
//     "note" : "มาเร็วววววว",
//     "timestamp" : ISODate("2017-02-01T07:35:02.939Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-02-01T10:34:00.000Z"),
//         "arrived" : ISODate("2017-02-01T10:34:00.000Z")
//     },
//     "destination" : {
//         "name" : "SWU",
//         "lat" : "13.7454649",
//         "lng" : "100.5631804",
//         "addr" : "SWU"
//     },
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.7055818",
//         "lng" : "100.5988887",
//         "addr" : "Bts onnut"
//     },
//     "__v" : 0
// }

// /* 19 */
// {
//     "_id" : ObjectId("5894603b9f783129c6327589"),
//     "route_id" : "19",
//     "note" : "--",
//     "seat" : "3",
//     "driver_id" : "2",
//     "direction" : "aazrAyswdRz@uA|AgClCoEbBeCdDeFvCyEhC}DzAeCzBmDbC}D~G{KpKyPlG_KnFqI`EsGfC}DhE_H\\g@pAuB`BgCrCoEnFqIlG{J`DaFfC_EzD_GzH_MdDmFtBaDZg@^k@~@mAnCkE\\i@hC{Df@y@d@u@zAuBlBiBfAg@dFqBfM}E`LoEpJyDzCiANGL\\a@NiAb@wHxCuChA}EjBcBp@gBr@",
//     "timestamp" : ISODate("2017-02-03T10:49:31.438Z"),
//     "route_status" : "please_wait",
//     "current_seat" : "empty",
//     "date" : {
//         "start" : ISODate("2017-02-03T09:51:00.000Z")
//     },
//     "destination" : {
//         "name" : "Bts onnut",
//         "lng" : "100.60099",
//         "lat" : "13.70562",
//         "addr" : "prakanong sukhumvit bkk"
//     },
//     "origin" : {
//         "name" : "Terminal 21",
//         "lng" : "100.56038",
//         "lat" : "13.73762",
//         "addr" : "sukhumvit19 bkk"
//     },
//     "__v" : 0
// }

// /* 20 */
// {
//     "_id" : ObjectId("589460ac9f783129c632758a"),
//     "route_id" : "20",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "w|~rAaeydRObAIl@CNpA|@x@h@~@b@pAn@pAl@`ATtAZr@P`Dj@pC^bALjBVnBXnALdBNzCb@bALb@F`@LdAVjAPfAL`ALpEl@pHbA`Dh@vANSzDWtDYtDMXMtBE~@G~@[`FYtEQrCg@nJ@rB@f@HnBPhINjJDx@LlGR~FP`IB`A?LH?n@DlAFrANlFf@dFj@nGp@|BTP@UjC_@~DKrA[lDUhCAJIAI?CPEj@In@Iz@eAjKm@pGVBEb@STCNOtA_@`E",
//     "note" : "",
//     "timestamp" : ISODate("2017-02-03T10:51:24.476Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-02-03T17:51:00.000Z"),
//         "arrived" : ISODate("2017-02-03T17:51:00.000Z")
//     },
//     "destination" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.74576",
//         "lng" : "100.53419",
//         "addr" : "Siam Paragon"
//     },
//     "origin" : {
//         "name" : "True tower",
//         "lat" : "13.7624",
//         "lng" : "100.56813",
//         "addr" : "True tower"
//     },
//     "__v" : 0
// }

// /* 21 */
// {
//     "_id" : ObjectId("589461709f783129c632758b"),
//     "route_id" : "21",
//     "driver_id" : "7",
//     "seat" : "3",
//     "direction" : "_{srA}r_eR{EhBj@nA`CzFr@|BVr@l@nBl@|DbB~HnAvFj@nCdB`It@vBp@jBfBpExCShCSzHa@hESD]CUGMMKWGm@Bk@DQAMEQOISIe@BYVk@f@c@h@Sj@WFKBSCWMU[QOASBs@RuBr@eAP{@Xm@PmAZaJpCiGrBqBr@_AXeB~@yAfA_CpBuA~Am@|@i@v@uBhEiFtKGPuAdD}@`C[z@{AvEyJd[w@hCw@~CSbAGl@?v@LhBb@hD|ApMLz@Lp@j@`D\\~BTzA\\bC`@tCd@vDLbB@hAGnAEt@ATIp@WbAWn@]n@kExGgA`Bo@~@iEjGqA~AiBdC{@dAe@t@s@tAYv@sAzCy@dBUb@Sh@gAbB}@nAiAfAMJq@b@SROHKD_Bp@s@P_ALwALqBJmF\\oBDm@@G?CHe@tAq@vBeA~C_BbF}DlMe@zAM`@[l@gBvFITc@rASr@kChIUhAWv@s@`CqAbEi@pBiChIM\\{@rCq@rBuAlEmBlGm@xBGTWG_@IoEY_F_@aFYqMeAyPyAaOiAgGi@wC[iFi@STCNOtA_@`E",
//     "note" : "",
//     "timestamp" : ISODate("2017-02-03T10:54:40.564Z"),
//     "route_status" : "ready",
//     "current_seat" : "remain",
//     "date" : {
//         "start" : ISODate("2017-02-03T17:51:00.000Z"),
//         "arrived" : ISODate("2017-02-03T17:51:00.000Z")
//     },
//     "destination" : {
//         "name" : "Siam Paragon",
//         "lat" : "13.74576",
//         "lng" : "100.53419",
//         "addr" : "Siam Paragon"
//     },
//     "origin" : {
//         "name" : "Bts onnut",
//         "lat" : "13.70562",
//         "lng" : "100.60099",
//         "addr" : "Bts onnut"
//     },
//     "__v" : 0
// }

// /* 22 */
// {
//     "_id" : ObjectId("589461ad9f783129c632758c"),
//     "route_id" : "22",
//     "note" : "fuck au",
//     "seat" : "2",
//     "driver_id" : "2",
//     "direction" : "cq{rAgfxdRWlB]EcAOqC_@iEm@aFs@SCUBm@IGAm@IiDc@{@KoL_BeDe@{@KsAQ{@WgCWqCe@{@KYA_Ee@iDa@wHgAw@S_Dy@oAi@kAm@aAi@mCgBaKqHo@e@FKFKTNbBnAdCjBdCfBl@b@BOHm@Hk@DW",
//     "timestamp" : ISODate("2017-02-03T10:55:41.229Z"),
//     "route_status" : "cancel",
//     "current_seat" : "empty",
//     "date" : {
//         "start" : ISODate("2017-02-03T09:57:00.000Z")
//     },
//     "destination" : {
//         "name" : "True tower",
//         "lng" : "100.56813",
//         "lat" : "13.7624",
//         "addr" : "dindaeng bkk"
//     },
//     "origin" : {
//         "name" : "SWU",
//         "lng" : "100.5631804",
//         "lat" : "13.7454649",
//         "addr" : "sukhumvit23 bkk"
//     },
//     "__v" : 0
// }