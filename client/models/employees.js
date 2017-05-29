var db = require('./connection.js');
counter = require('./counters');

//Employees Schema
const employeeSchema = db.Mongoose.Schema({ 
	employee:{
		emp_id:{ type: String, index: { unique: true } },
		email:{ type: String, required: true, index: { unique: true } },
		password:{ type: String, required: true },
		fName:{ type: String, required: true },
		lName:{ type: String, required: true },
		sName:{ type: String },
		gender:{ type: String, required: true, enum: ["male","female"] },
		birth:{ type: Date },
		phone:{ type: String, required: true },
		department:{ type: String, required: true },
		pic:{ type: String },
		regtoken: { type: String },
		login:{ type: Boolean, default: false }
	},
	car: {
		number:{ type: String },
		model:{ type: String },
		color:{ type: String },
		license:{ type: String },
		register:{ type: Boolean, default: false }
	},
	favourite: {
		cartoon:{ type: Boolean, default: false },
		food:{ type: Boolean, default: false },
		game:{ type: Boolean, default: false },
		movie:{ type: Boolean, default: false },
		shopping:{ type: Boolean, default: false },
		sport:{ type: Boolean, default: false },
		technology:{ type: Boolean, default: false },
		travel:{ type: Boolean, default: false },
		selected:{ type: Boolean, default: false }
	},
	score: {
		 type: Number, default: 0 
	}
}, {collection:'Employees'});

//----------------------------------------------------------------------------
// for auto increment emp_id 
//----------------------------------------------------------------------------

employeeSchema.pre('save', function(next) {
    var doc = this;
    DOC = doc
    counter.findByIdAndUpdate({_id: 'employee.emp_id'}, {$inc: { seq: 1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        doc.employee.emp_id = counter.seq;
        next();
    });
});

//----------------------------------------------------------------------------
// for call from app.js 
//----------------------------------------------------------------------------

const Emp = module.exports =  db.Connection.model('Employees', employeeSchema);

//----------------------------------------------------------------------------
// for decrement emp_id by 1 (-1)
//----------------------------------------------------------------------------

module.exports.decreaseEmpIdByOne = function() {
    counter.findByIdAndUpdate({_id: 'employee.emp_id'}, {$inc: { seq: -1}}, {"upsert": true, "new": true} , function(error, counter)   {
        if(error)
            return next(error);
        console.log(DOC)
        DOC.employee.emp_id = counter.seq;
    });
}

// Get all Employee
module.exports.getEmps = function(callback, limit) {
	Emp.find({}, {'_id':0, '__v':0}, callback).limit(limit);
}

// Get Employee by ID
module.exports.getEmpById = function(empid, callback) {
	Emp.findOne({'employee.emp_id': empid}, {'_id':0, '__v':0}, callback);
}

// Get Employee by name
module.exports.getEmpByName = function(fname, callback) {
	Emp.find({'employee.fName': new RegExp(fname, 'i')}, {'_id':0, '__v':0}, callback);
}

// Add Employee
module.exports.addEmp = function(emp, callback) {
	Emp.create(emp, callback);
}

// Update Employee
module.exports.updateEmp = function(empid, emp, options, callback) {
	var query = {'employee.emp_id': empid};
	Emp.findOneAndUpdate(query, emp, options, callback);
}

// Update new score
module.exports.updateNewScore = function(empid, score, options, callback) {
	var query = {'employee.emp_id': empid};
	var addScore = {$inc: {'score' : score}};
	Emp.findOneAndUpdate(query, addScore, options, callback);
}

// Delete Employee
module.exports.removeEmp = function(empid, callback) {
	Emp.remove({'employee.emp_id': empid}, callback);
}

// for log in
module.exports.loginEmp = function(emp, callback) {
	Emp.findOne({'employee.email': emp.email, 
		'employee.password': emp.password}, 
		{'_id':0, '__v':0, 'employee.password':0}, function(err, result){
        if (err) { 
            console.error('Log in fail, please try again');
            callback('Log in fail, please try again');
        }
        else if (result === null) {        	
            console.log('Log in fail');
            callback(null);
        }
        else { 
            console.log('Log in success');
            callback(result);
        }
    });
}






//-------------------------- data example---------------------------
// /* 1 */
// {
//     "_id" : ObjectId("585c036a06eeb71eb8b0c742"),
//     "employee" : {
//         "emp_id" : "1",
//         "password" : "ttttt",
//         "email" : "test@t.t",
//         "fName" : "Parinya",
//         "lName" : "Chavanasuvarngull",
//         "sName" : "ChavP",
//         "gender" : "male",
//         "birth" : ISODate("1990-08-22T03:00:00.000Z"),
//         "phone" : "0800001234",
//         "department" : "development",
//         "pic" : "http://61.90.233.80/cartrue/images/profile/2017/1.jpg",
//         "login" : true,
//         "regtoken" : "f3ENtEqQ3Y4:APA91bE733BSXbX-kseF0VF4Y1_krEIvp6Gz5bnJShMD0ILy0Jpeh49qhIocSKad6dcQ_Mlvqm_kTvPenfiqPSrNvhHeibW5KWK9dGemtbwGWCczAhyT11LMySPGtRkxW5IIRs0jcWpA"
//     },
//     "car" : {
//         "register" : true,
//         "license" : "a bvcfg",
//         "color" : "red",
//         "model" : "ToYoBo1",
//         "number" : "1234"
//     },
//     "favourite" : {
//         "cartoon" : true,
//         "food" : true,
//         "game" : false,
//         "movie" : false,
//         "sport" : true,
//         "technology" : false,
//         "travel" : true,
//         "shopping" : true,
//         "selected" : true
//     },
//     "__v" : 0,
//     "score" : 90
// }

// /* 2 */
// {
//     "_id" : ObjectId("585c045506eeb71eb8b0c743"),
//     "employee" : {
//         "emp_id" : "2",
//         "password" : "nnnnn",
//         "email" : "non@n.n",
//         "fName" : "Panchorn",
//         "lName" : "Lertvipada",
//         "sName" : "Non",
//         "gender" : "male",
//         "birth" : ISODate("1995-04-02T19:00:00.000Z"),
//         "phone" : "0839259127",
//         "department" : "Human Resource",
//         "pic" : "http://61.90.233.80/cartrue/images/profile/2017/2.jpg",
//         "login" : true,
//         "regtoken" : "ddYaq0tuKuc:APA91bGHZYmVfX_bkyPzql_ONQyBllIk_JzL4y0HVrkNV1syLO3dNjzQegX9n8-tXfq59fsR7taOf8nHb8fA7XLr6yUnVo9wBstcNES1gEf8oA47DLn0bwE7SoT894Y6GFiux9gdC85_"
//     },
//     "car" : {
//         "register" : true,
//         "license" : "49001111",
//         "color" : "black",
//         "model" : "Yaris",
//         "number" : "ac5566"
//     },
//     "__v" : 0,
//     "favourite" : {
//         "cartoon" : true,
//         "game" : true,
//         "food" : true,
//         "movie" : true,
//         "shopping" : true,
//         "sport" : true,
//         "technology" : false,
//         "travel" : true,
//         "selected" : true
//     },
//     "score" : 78.0
// }

// /* 3 */
// {
//     "_id" : ObjectId("585c04d506eeb71eb8b0c744"),
//     "employee" : {
//         "emp_id" : "3",
//         "email" : "n@n.n",
//         "password" : "nnnnn",
//         "fName" : "Non",
//         "lName" : "Sunday",
//         "sName" : "Non",
//         "gender" : "male",
//         "birth" : ISODate("1993-07-09T22:30:00.000Z"),
//         "phone" : "0871239870",
//         "pic" : "http://61.90.233.80/cartrue/images/profile/2017/3.jpg",
//         "department" : "Human Resource",
//         "login" : true,
//         "regtoken" : "e17FOe7nIXk:APA91bGnqL9jpWXRHOxx9XxqnSeCzhhNayWSqFuYpvPTWAvsZS5-q5if0qTSqh_zZflyJ7kvvDiTG7TxA0jAzDzm7gFraC_voyqksTI0wMJZijDMRizODTADQwRMslgEFstahafsv2Zx"
//     },
//     "car" : {
//         "number" : "bb3211",
//         "model" : "z200",
//         "color" : "white",
//         "license" : "49008888",
//         "register" : true
//     },
//     "__v" : 0,
//     "favourite" : {
//         "cartoon" : true,
//         "food" : true,
//         "game" : true,
//         "movie" : true,
//         "shopping" : true,
//         "sport" : true,
//         "technology" : true,
//         "travel" : true,
//         "selected" : true
//     },
//     "score" : 41
// }