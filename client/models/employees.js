var db = require('./connection.js');
counter = require('./counters');
var DOC = null;

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
	// console.log('score : ' + score);
	// console.log('emp_id : ' + empid);
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
//         "email" : "chavP@gmail.com",
//         "password" : "12345678",
//         "fName" : "Parinya",
//         "lName" : "Chavanasuvarngull",
//         "sName" : "ChavP",
//         "gender" : "male",
//         "birth" : ISODate("1990-08-22T03:00:00.000Z"),
//         "phone" : "0800001234",
//         "department" : "development",
//         "pic" : "http://47.88.241.73/CarTrue/images/profile/1.jpg",
//         "login" : false
//     },
//     "car" : {
//         "number" : "กข1234",
//         "model" : "Civic",
//         "color" : "red",
//         "license" : "49005678",
//         "register" : true
//     },
//     "__v" : 0
// }

// /* 2 */
// {
//     "_id" : ObjectId("585c045506eeb71eb8b0c743"),
//     "employee" : {
//         "emp_id" : "2",
//         "email" : "nonpcn@gmail.com",
//         "password" : "admin",
//         "fName" : "Panchorn",
//         "lName" : "Lertvipada",
//         "sName" : "Non",
//         "gender" : "male",
//         "birth" : ISODate("1995-04-02T19:00:00.000Z"),
//         "phone" : "0923122231",
//         "department" : "Human Resource",
//         "pic" : "http://47.88.241.73/CarTrue/images/profile/2.jpg",
//         "login" : false,
//         "regtoken" : "da-ufnTBm28:APA91bHH8a3uNaYADyxheWmEOea2_6cz8qZ2r1TFUbufD-JETqkn0ysNOr3uvlKLzprwt5z5yg6t3VY8_CeO9Wlvy2rUyKNcfAPiX5Qa_WwvVuJGdFI5FSGJuG9vSP3NxrmgB1FMIZbV"
//     },
//     "car" : {
//         "number" : "aa1221",
//         "model" : "Yaris",
//         "color" : "black",
//         "license" : "49001111",
//         "register" : true
//     },
//     "__v" : 0
// }

// /* 3 */
// {
//     "_id" : ObjectId("585c04d506eeb71eb8b0c744"),
//     "employee" : {
//         "emp_id" : "3",
//         "email" : "nsunday@gmail.com",
//         "password" : "root",
//         "fName" : "Non",
//         "lName" : "Sunday",
//         "sName" : "Non",
//         "gender" : "male",
//         "birth" : ISODate("1993-07-09T22:30:00.000Z"),
//         "phone" : "0871239870",
//         "department" : "Human Resource",
//         "pic" : "http://47.88.241.73/CarTrue/images/profile/3.jpg",
//         "login" : false
//     },
//     "car" : {
//         "number" : "ขข3211",
//         "model" : "z200",
//         "color" : "white",
//         "license" : "49008888",
//         "register" : true
//     },
//     "__v" : 0
// }

// /* 4 */
// {
//     "_id" : ObjectId("585c04ef06eeb71eb8b0c745"),
//     "employee" : {
//         "emp_id" : "4",
//         "email" : "nrohcnap@gmail.com",
//         "password" : "naprel",
//         "fName" : "Nrohcnap",
//         "lName" : "Adapivtrel",
//         "sName" : "Nap",
//         "gender" : "female",
//         "phone" : "021139887",
//         "department" : "Development",
//         "pic" : "http://47.88.241.73/CarTrue/images/profile/4.jpg",
//         "login" : false
//     },
//     "car" : {
//         "number" : "พพ3499",
//         "model" : "Altis",
//         "color" : "black",
//         "license" : "49005577",
//         "register" : true
//     },
//     "__v" : 0
// }

// /* 5 */
// {
//     "_id" : ObjectId("585c051c06eeb71eb8b0c746"),
//     "employee" : {
//         "regtoken" : "c_Gxxh0PyIY:APA91bHvholvYmn_pUXlo4UpYNhlPs-7lscDhBSDUCw8UYf-a8TjNoN_HUb_tpG3SUR_f4_mmE2eos5Sfzlaix0g1Otl-aUL3U-QavO-vzr9dgf2rrltZ_2oRRD6kPAl67myUs2Kaxvv",
//         "login" : true,
//         "pic" : "http://47.88.241.73/CarTrue/images/profile/5.jpg",
//         "department" : "System Analysis",
//         "phone" : "089752214",
//         "gender" : "male",
//         "sName" : "JW",
//         "lName" : "Winson",
//         "fName" : "John",
//         "password" : "12345678",
//         "email" : "winsonjw@gmail.com",
//         "emp_id" : "5"
//     },
//     "car" : {
//         "register" : true,
//         "license" : "1234",
//         "number" : "test1234",
//         "model" : "test",
//         "color" : "test"
//     },
//     "__v" : 0
// }

// /* 6 */
// {
//     "_id" : ObjectId("585c052e06eeb71eb8b0c747"),
//     "employee" : {
//         "regtoken" : "e0ZTn741fts:APA91bG4KjLQc1FTTnhy6RcDNvvMJt7sQ_0lIIYM6sPxMCR0WkYgftX5oWYQDXDkrikIeUiXx68sCvguh7FvYzPcEz8Q90SxEqs0I4bUef6CN_I13D7HbShaL9V48u2JeETddieNbf9X",
//         "login" : true,
//         "pic" : "http://47.88.241.73/CarTrue/images/profile/6.jpg",
//         "department" : "IT",
//         "phone" : "0899999999",
//         "gender" : "male",
//         "sName" : "Ossas",
//         "lName" : "msn",
//         "fName" : "js",
//         "password" : "12345",
//         "email" : "js@msn.com",
//         "emp_id" : "6"
//     },
//     "car" : {
//         "register" : true,
//         "license" : "12tejgduwmdn",
//         "color" : "Gold",
//         "model" : "sl123",
//         "number" : "Saleng"
//     },
//     "__v" : 0
// }

// /* 7 */
// {
//     "_id" : ObjectId("585d39473283781bb4563e3d"),
//     "employee" : {
//         "regtoken" : "ew6uiG-9zZs:APA91bGkm2-RsyRzy7TpG_rUd6LaofRU7bVxLRLAdC-JFg2mj1hplBSp0tdkjeBSuE4L0I6Nsc2WAALSzrVEBgOsyQtUkf6BId-06vRKiUScn5VctIj0WWasuLjeR0v4CrqhetFU_wdY",
//         "login" : true,
//         "pic" : "http://47.88.241.73/CarTrue/images/profile/7.jpg",
//         "department" : "IT",
//         "phone" : "0899999999",
//         "gender" : "male",
//         "sName" : "Ossas",
//         "lName" : "handsome",
//         "fName" : "tester",
//         "password" : "mmmmm",
//         "email" : "m@m.m",
//         "emp_id" : "7"
//     },
//     "car" : {
//         "register" : true,
//         "license" : "asdsadasdsadas",
//         "color" : "blue",
//         "model" : "cam",
//         "number" : "aa9999"
//     },
//     "__v" : 0
// }