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
		login:{ type: Boolean, default: false }
	},
	car: {
		number:{ type: String },
		model:{ type: String },
		color:{ type: String },
		license:{ type: String },
		register:{ type:Boolean, default: false }
	}
}, {collection:'Employees'});

//----------------------------------------------------------------------------
// for auto increment emp_id 
//----------------------------------------------------------------------------

employeeSchema.pre('save', function(next) {
    var doc = this;
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
	Emp.find({'employee.fName': new RegExp(fname)}, {'_id':0, '__v':0}, callback);
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
//     "employee" : {
//         "emp_id" : "0001",
//         "email" : "chavP@gmail.com",
//         "password" : "12345678",
//         "fName" : "Parinya",
//         "lName" : "Chavanasuvarngull",
//         "sName" : "ChavP",
//         "gender" : "male",
//         "birth" : ISODate("1990-08-22T03:00:00.000Z"),
//         "phone": "0800001234",
//         "department" : "development",
//         "pic": "http://thesocialmediamonthly.com/wp-content/uploads/2015/08/photo.png",
//         "login" : false
//     },
//     "car" : {
//         "number" : "กข1234",
//         "model" : "Civic",
//         "color" : "red",
//         "license" : "49005678",
//         "register" : true
//     }
// }

// /* 2 */
// {
//     "employee" : {
//         "emp_id" : "0002",
//         "email" : "nonpcn@gmail.com",
//         "password" : "admin",
//         "fName" : "Panchorn",
//         "lName" : "Lertvipada",
//         "sName" : "Non",
//         "gender" : "male",
//         "birth" : ISODate("1995-04-02T19:00:00.000Z"),
//         "phone": "0923122231",
//         "department" : "Human Resource",
//         "pic": "http://thesocialmediamonthly.com/wp-content/uploads/2015/08/photo.png",
//         "login" : false
//     },
//     "car" : {
//         "number" : "aa1221",
//         "model" : "Yaris",
//         "color" : "black",
//         "license" : "49001111",
//         "register" : true
//     }
// }

// /* 3 */
// {
//     "employee" : {
//         "emp_id" : "0003",
//         "email" : "nsunday@gmail.com",
//         "password" : "root",
//         "fName" : "Non",
//         "lName" : "Sunday",
//         "sName" : "Non",
//         "gender" : "male",
//         "birth" : ISODate("1993-07-09T22:30:00.000Z"),
//         "phone": "0871239870",
//         "department" : "Human Resource",
//         "pic": "http://thesocialmediamonthly.com/wp-content/uploads/2015/08/photo.png",
//         "login" : false
//     },
//     "car" : {
//         "number" : "ขข3211",
//         "model" : "z200",
//         "color" : "white",
//         "license" : "49008888",
//         "register" : true
//     }
// }

// /* 4 */
// {
//     "employee" : {
//         "emp_id" : "0004",
//         "email" : "nrohcnap@gmail.com",
//         "password" : "naprel",
//         "fName" : "Nrohcnap",
//         "lName" : "Adapivtrel",
//         "sName" : "Nap",
//         "gender" : "female",
//         "phone": "021139887",
//         "department" : "Development",
//         "pic": "http://thesocialmediamonthly.com/wp-content/uploads/2015/08/photo.png",
//         "login" : false
//     },
//     "car" : {
//         "number" : "พพ3499",
//         "model" : "Altis",
//         "color" : "black",
//         "license" : "49005577",
//         "register" : true
//     }
// }

// /* 5 */
// {
//     "employee" : {
//         "emp_id" : "0005",
//         "email" : "winsonjw@gmail.com",
//         "password" : "12345678",
//         "fName" : "John",
//         "lName" : "Winson",
//         "sName" : "JW",
//         "gender" : "male",
//         "birth" : ISODate("1992-11-01T11:40:00.000Z"),
//         "phone": "089752214",
//         "department" : "System Analysis",
//         "pic": "http://thesocialmediamonthly.com/wp-content/uploads/2015/08/photo.png",
//         "login" : false
//     },
//     "car" : {
//         "register" : false
//     }
// }

// /* 6 */
// {
//     "employee" : {
//         "emp_id" : "0006",
//         "email" : "js@msn.com",
//         "password" : "12221",
//         "fName" : "John",
//         "lName" : "Snow",
//         "gender" : "male",
//         "phone": "0918277726",
//         "department" : "Manager,HR",
//         "pic": "http://thesocialmediamonthly.com/wp-content/uploads/2015/08/photo.png",
//         "login" : false
//     },
//     "car" : {
//         "register" : false
//     }
// }

// /* 7 */
// {
//     "employee" : {
//         "emp_id" : "0007",
//         "email" : "m@m.m",
//         "password" : "mmmmm",
//         "fName" : "tester",
//         "lName" : "handsome",
//         "sName" : "Ossas",
//         "gender" : "male",
//         "phone" : "0899999999",
//         "department" : "IT",
//         "pic" : "https://scontent.fbkk2-1.fna.fbcdn.net/v/t1.0-9/13423902_1375022525846194_2828488072321914208_n.jpg?oh=be39990bfe7aab6d38373be71d83e937&oe=58F4BFCF",
//         "login" : false
//     },
//     "car" : {
//         "register" : false
//     }
// }