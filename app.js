const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// const mongoose = require('mongoose');
// mongoose.connection.on("open", function(ref) {
//   console.log("Connected to mongo server.");
//   return start_up();
// });
// mongoose.connection.on("error", function(err) {
//   console.log("Could not connect to mongo server!");
//   return console.log(err);
// });

const port = process.env.PORT || 3001;

//todo: 20161230: Jun : for fix issue: CORS -> http://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname+'/client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

Emp = require('./client/models/employees');
Rou = require('./client/models/routes');
Req = require('./client/models/requests');
Lan = require('./client/models/landmarks');
Mat = require('./client/controllers/matching');
Nor = require('./client/controllers/sendnorti');

//Connect to mongoose
// mongoose.Promise = global.Promise;
// const db = mongoose.connect('mongodb://localhost:27017/CarTrue');
// const db = mongoose.connect('mongodb://cartrueSWUrw:8kiNmi^dy[,L;@61.90.233.80:27017/PLEASE_READ').connection;
// const db = mongoose.connect('mongodb://admin02:pass@47.88.241.73:27017/CarTrue').connection;


//----------------------------------------------------------------------------
// for employee only!!!
//----------------------------------------------------------------------------

//show text
app.get('/', function (req, res) {
    res.send('<h1>Hello MEAN Stack</h1>');
});

//Todo: Jun: 20161223: for testing
app.get('/refresh', function (req, res) {
    res.send('<h1>Hello Car True by SWU version 1.0, phase 01,R03: Refresh</h1>');
});

//show text
app.get('/index', function (req, res) {
    res.send('<h1>This is index page</h1>');
});

//get all users 
app.get('/emp/users', function (req, res) {
    Emp.getEmps(function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//get on user by emp_id
app.get('/emp/id/:empid', function (req, res) {
    Emp.getEmpById(req.params.empid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get user by fName
app.get('/emp/name/:fname', function (req, res) {
    // db.model('students').find({'student.firstName': new RegExp(fname)}, {_id:0}, function (err, data) {
    Emp.getEmpByName(req.params.fname, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//insert new user
app.post('/emp/newuser', function (req, res) {
    var emp = req.body;
    Emp.addEmp(emp, function(err, data) {
        if (err) { console.error(err); res.send(err.toString()); }
        else { 
            console.log('Added employee no.' + data.employee.emp_id); 
            res.json('Added employee no.' + data.employee.emp_id); 
        }
    });
});

//update user by emp_id
app.put('/emp/edituser/:empid', function (req, res) {
    var empid = req.params.empid;
    var emp = req.body;
    Emp.updateEmp(empid, emp, function(err, data){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});

//delete user by emp_id
app.delete('/emp/removeuser/:empid', function (req, res) {
    // var id = parseInt(req.params.id, 10) // if _id is int number
    var empid = req.params.empid; // or .toString() if _id is string
    Emp.removeEmp(empid, function(err, result){
        if (err) { console.error(err); res.send(err.toString()); }
        else if (result.result.n === 0) { 
            console.log('No employee data to remove'); 
            res.send('No employee data to remove'); 
        }
        else { 
            console.log('Removed ' + result + ' : emp_id=' + empid); 
            res.json('Removed ' +  result + ' : emp_id=' + empid); 
        }
    });
});

//for login
app.post('/emp/login', function (req, res) {
    var emp = req.body;
    Emp.loginEmp(emp, function (data, err) {
        if (err) { console.error(err); }
        else if (data === 0) { console.log('Somthing wrong, please try again'); res.json(data); }
        else { console.log(data); res.json(data); }
    });
});


//----------------------------------------------------------------------------
// for route only!!!
//----------------------------------------------------------------------------

//get all routes of one driver by driver_id (driver_id == emp_id)
app.get('/route/driverid/:driverid', function (req, res) {
    Rou.getRouteByDriverId(req.params.driverid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get detail of a route by route_id 
app.get('/route/routeid/:routeid', function (req, res) {
    Rou.getRouteByRouteId(req.params.routeid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get route for history page (driver)
app.get('/route/history/driverid/:driverid', function (req, res) {
    Rou.getRouteForHistoryD(req.params.driverid, function (err, data) {
        if (err) { console.error(err); res.json(err); }
        else { console.log(data); res.json(data); }
    });
});

//insert new route
app.post('/route/newroute', function (req, res) {
    var route = req.body;
    Rou.addRoute(route, function(err, data) {
        if (err) { console.error(err); res.send(err.toString()); }
        else { 
            console.log('Added route no.' + data.route_id); 
            res.json(data.route_id); 
        }
    });
});

//update route by route_id
app.put('/route/editroute/:routeid', function (req, res) {
    var routeid = req.params.routeid;
    var route = req.body;
    Rou.updateRoute(routeid, route, function(err, data){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});

//delete route by route_id
app.delete('/route/removeroute/:routeid', function (req, res) {
    var routeid = req.params.routeid; 
    Rou.removeRoute(routeid, function(err, result){
        if (err) { console.error(err); res.send(err.toString()); }
        else if (result.result.n === 0) { 
            console.log('No data to remove'); 
            res.send('No data to remove'); 
        }
        else { 
            console.log('Removed ' + result + ' : route_id=' + routeid); 
            res.json('Removed ' +  result + ' : route_id=' + routeid); 
        }
    });
});


//----------------------------------------------------------------------------
// for request only!!!
//----------------------------------------------------------------------------

//get requests that accepted of a route by route_id
app.get('/request/routeid/:routeid', function (req, res) {
    Req.getRequestByRouteId(req.params.routeid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get request for history page (passenger)
app.get('/request/history/passengerid/:passengerid', function (req, res) {
    Req.getRouteForHistoryP(req.params.passengerid, function (err, data) {
        if (err) { console.error(err); res.json(err); }
        else { console.log(data); res.json(data); }
    });
});

//insert new request
app.post('/request/newrequest', function (req, res) {
    var request = req.body;
    Req.addRequest(request, function(err, data) {
        if (err) { console.error(err); res.send(err.toString()); }
        else { 
            console.log('Added request no.' + data.request_id); 
            res.json('Added request no.' + data.request_id); 
        }
    });
});

//update request by request_id
app.put('/request/editrequest/:requestid', function (req, res) {
    var requestid = req.params.requestid;
    var request = req.body;
    Req.updateRequest(requestid, request, function(err, data){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});

//delete request by request_id
app.delete('/request/removerequest/:requestid', function (req, res) {
    var requestid = req.params.requestid; 
    Req.removeRequest(requestid, function(err, result){
        if (err) { console.error(err); res.send(err.toString()); }
        else if (result.result.n === 0) { 
            console.log('No data to remove'); 
            res.send('No data to remove'); 
        }
        else { 
            console.log('Removed ' + result + ' : request_id=' + requestid); 
            res.json('Removed ' +  result + ' : request_id=' + requestid); 
        }
    });
});

//update status of request to 'cancel' by request_id
app.put('/request/statuscancel/:requestid', function (req, res) {
    var requestid = req.params.requestid;
    Req.updateStatusCancel(requestid, function(err, data){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});


//----------------------------------------------------------------------------
// for landmarks only!!!
//----------------------------------------------------------------------------

//get all landmarks 
app.get('/landmark/all', function (req, res) {
    Lan.getAllLandmark(function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//get landmark by land_id
app.get('/landmark/id/:landid', function (req, res) {
    var landid = req.params.landid;
    Lan.getLandmarkById(landid, function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//get landmark by name
app.get('/landmark/name/:landname', function (req, res) {
    var landname = req.params.landname;
    Lan.getLandmarkByName(landname, function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//insert new landmark
app.post('/landmark/newlandmark', function (req, res) {
    var landmark = req.body;
    Lan.addLandmark(landmark, function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//update landmark by land_id
app.put('/landmark/editlandmark/:landid', function (req, res) {
    var landid = req.params.landid;
    var landmark = req.body;
    Lan.updateLandmark(landid, landmark, function(err, data){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});

//delete landmark by lan_id
app.delete('/landmark/removelandmark/:landid', function (req, res) {
    var landid = req.params.landid; 
    Lan.removeLandmark(landid, function(err, result){
        if (err) { console.error(err); res.send(err.toString()); }
        else if (result.result.n === 0) { 
            console.log('No landmark to remove'); 
            res.send('No landmark to remove'); 
        }
        else { 
            console.log('Removed ' + result + ' : land_id=' + landid); 
            res.json('Removed ' +  result + ' : land_id=' + landid); 
        }
    });
});


//----------------------------------------------------------------------------
// for matching process!!!
//----------------------------------------------------------------------------

//matching route and request
//client have to send 'From' and 'To' here!
app.post('/matching', function (req, res) {
    var request = req.body;
    Mat.matchingRoute(request.from, request.to, function(result, err){
        if (err) { 
            console.error('err');
        }
        else { 
            console.log('matching pass');
            res.send(result);
        }
    });
});


//----------------------------------------------------------------------------
// for matching process!!!
//----------------------------------------------------------------------------

//sendnorti
//client have to send 'driver_id' here!
app.post('/norti', function (req, res) {
    var request = req.body;
    Nor.sendnorti(req.body.driverid,req.body.fname, function(result, err){
        if (err) { 
            console.error('err');
        }
        else { 
            console.log('send succes');
            res.send(result);
        }
    });
});


//----------------------------------------------------------------------------

app.listen(port, function() {
    console.log('Starting node.js on port ' + port);
});

module.exports = app;