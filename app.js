const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const async = require('async');

// NON TEST UPLOAD FILE 22042017
//var multer = require('multer');
//var upload = multer({ dest: 'uploads/' }); //'../websites/images/car/2017/'
var fs = require('fs');
var path = require('path');
//var util = require('util');

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
Adm = require('./client/models/admins');
CurLo = require('./client/models/current_location');
FavRou = require('./client/models/fav_route');
Mat = require('./client/controllers/matching');
Nor = require('./client/controllers/sendnoti');

//----------------------------------------------------------------------------
// for upload only!!! (DON'T DELETE THIS CODE by non)
//----------------------------------------------------------------------------
// app.post('/upload', function(req, res){
//  console.log("Received file:\n" + JSON.stringify(req.files));
//  var upDir = __dirname+"/upload/";
//  var fileName = req.files.source.name;
//  var content = request.body.content;
//  fs.rename(
//      req.files.source.path,
//      upDir+fileName,function(err){
//          if(err != null){
//              console.log(err)
//              res.send({error:"Server Writting No Good"});
//          }
//          else{
//              fs.writeFileSync(upDir+fileName,content,'utf-8');
//              res.send("Ok");
//          }
//  });
// });

// app.get('/info', function(req, res){
//  console.log(__dirname);
//  res.send("ok");
// });


// NON TEST UPLOAD FILE 22042017
// app.post('/upload', upload.single('file'), function (req, res, next) {
//     var pathArray = req.file.path.split( '/' );
//     console.log('file info: ',req.file);
//     var content = req.body.content;
//     fs.rename(
//         req.file.path,
//         'uploads/' + req.file.originalname, function(err){
//             if(err != null){
//                 console.log(err);
//                 res.send({error:"Server Writting No Good"});
//             }
//             else{
//         // console.log(req.file)
//                 res.end(util.format(' Task Complete \n uploaded %s (%d Kb) to %s as %s'
//                     , req.file.originalname
//                     , req.file.size / 1024 | 0
//                     , pathArray
//                     , req.body.title
//                     , req.file
//                     , '<img src="' + pathArray[(pathArray.length - 1)] + '">'
//                 ));
//             }
//     });
// });
app.post('/upload', function(req, res) {
  fs.readFile(req.files.image.path, function (err, data) {
    var imageName = req.files.image.name
    /// If there's an error
    if(!imageName){
      console.log("There was an error")
      res.redirect("/");
      res.end();
    } else {
      var newPath = __dirname + "/uploads/fullsize/" + imageName;
      var thumbPath = __dirname + "/uploads/thumbs/" + imageName;
      // write file to uploads/fullsize folder
      fs.writeFile(newPath, data, function (err) {
        // write file to uploads/thumbs folder
        im.resize({
          srcPath: newPath,
          dstPath: thumbPath,
          width:   200
        }, function(err, stdout, stderr){
          if (err) throw err;
          console.log('resized image to fit within 200x200px');
        });
         res.redirect("/uploads/fullsize/" + imageName);
      });
    }
  });
});

//----------------------------------------------------------------------------
// for employee only!!!
//----------------------------------------------------------------------------

//Todo: Jun: 20161223: for testing
app.get('/', function (req, res) {
    res.send('<h1>Hello Car True by SWU version 1.0, phase 01.9</h1>');
});


//Todo: Jun: 20161223: for testing
app.get('/refresh', function (req, res) {
    res.send('<h1>Hello Car True by SWU version 1.0, phase 01,R03: Refresh</h1>');
});

//show text
app.get('/index', function (req, res) {
    res.send('<h1>This is index page</h1>');
});

//get on regtoken by emp_id
app.get('/regtoken/id/:empid', function (req, res) {
    Emp.getRegToken(req.params.empid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data.employee.regtoken); }
    });
});

//get all users 
app.get('/emp/users', function (req, res) {
    Emp.getEmps(function (err, data){
        if (err) { console.log(err); }
        else if (req.header('x-lock') == 'cartrue2016') { res.json(data); console.log(data); }
    //else { res.json(data); console.log(data); }
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
        if (err) { console.error('err'); Emp.decreaseEmpIdByOne(); res.json(err); }
        else { 
            console.log('Added employee no. ' + data.employee.emp_id); 

            forAddNewFavRoute({}, function(result, err) {
                if (err) { res.json(err); }
                else { 
                    console.log('Added fav_route no.' + result);

                    forAddNewCurLo({}, function(result2, err) {
                        if (err) { res.json(err); }
                        else { 
                            // console.log('Added current_location no.' + result2);
                            res.json('success'); 
                        }
                    });
                }
            });
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

//update score
app.put('/emp/updatescore/:empid', function (req, res) {
    var empid = req.params.empid;
    var score = req.body.score;
    Emp.updateNewScore(empid, score, function(err, data){
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
        else if (req.header('x-lock') == 'cartrue2016') {
            if (data === null) { console.log('Somthing wrong, please try again'); res.json(data); }
            else { console.log(data); res.json(data); }
        }
    });
});


//----------------------------------------------------------------------------
// for route only!!!
//----------------------------------------------------------------------------

//get all routes
app.get('/route/all', function (req, res) {
    Rou.getAllRoutes(function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get all routes of one driver by driver_id (driver_id == emp_id)
app.get('/route/driverid/:driverid', function (req, res) {
    Rou.getRouteByDriverId(req.params.driverid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get all routes that status is 'ready'
app.get('/route/statusready', function (req, res) {
    Rou.getRouteByStatusReady(function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get routes ready_intravel of one driver by driver_id (driver_id == emp_id)
app.get('/route/statusfilter/driverid/:driverid', function (req, res) {
    Rou.getRouteByDriverIdAndStatus(req.params.driverid, function (err, data) {
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
        //if (err) { console.error(err); res.json(err); }
        //else { console.log(data); res.json(data); }
    if (err) { console.error(err); res.json(err); }
        else if (data.length == 0) { 
            res.json('no route history');   
            console.log(data); 
        }
        else { console.log(data); res.json(data); }
    });
});

//get route to select driver
app.post('/route/selectDriver', function (req, res) {
    var route = req.body;
    Rou.getRouteToSelectDriver(route.from, route.to, route.direction, route.gender, route.time, function (err, data) {
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
            Rou.updateTimestamp(data.route_id, function(err, data) {
                console.log('updated timestamp');
            });
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
        else { 
            // specific edit (req.status == cancel)
            if (route.route_status == 'cancel') {
                editRouteCancel(routeid, route, function(result, err) {
                    if (err) { res.json(err); }
                    else { res.json(result); }
                });
            }
            // specific edit (req.status == in_travel)
            else if (route.route_status == 'in_travel') {
                editRouteInTravel(routeid, route, function(result, err) {
                    if (err) { res.json(err); }
                    else { res.json(result); }
                });
            }
            // specific edit (req.status == arrived)
            else if (route.route_status == 'arrived') {
                Rou.updateRoute(routeid, {'date.arrived': route.arrived}, function(err, res) {
                    console.log(res)
                }); 
                editRouteArrived(routeid, route, function(result, err) {
                    if (err) { res.json(err); }
                    else { res.json(result); }
                });
            }
            // normal edit
            else {
                console.log(data); 
                res.json(data); 
            }
        }
    });
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////(START)use in edit route(START)//////////////////////////
///////////////////////////////////////////////////////////////////////////////

// after edit route_status to calcel 
// then change req_status to cancelt too, and send noti to their passenger
editRouteCancel = function(routeid, route, callback) {
    var changed = false;
    var count = 0;
    // get request by route_id (array of request is data2)
    Req.getRequestByRouteId(routeid, function (err, data2) {
        var page = 0,
        lastPage = data2.length-1;

        async.whilst(function () {
          return page <= lastPage;
        },
        function (next) {
          Req.updateRequest(data2[page].request_id, {'req_status': 'cancel'}, function(err, result) {
            if (data2[page].req_status == 'accepted' || data2[page].req_status == 'waiting') {
                changed = true;  
                count++;

                // send noti to passenger
                Nor.sendNotiWhenRouteCancel(data2[page].passenger_id, route.driverName); 
                
            }
            else {
                console.log('no current request');                            
            }
            if (page == lastPage) {
            }
            page++;
            next();
          });
        },
        function (err) {
            // All things are done!
            if (changed) {
                // res.json('updated status to cancel for ' + count + ' requests'); 
                console.log('updated status to cancel for ' + count + ' requests');
                callback('updated status to cancel for ' + count + ' requests');
            }
            else {
                // res.json('no status change to cancel'); 
                console.log('no status change to cancel');
                callback('no status change to cancel');
            }        
        });
    });
}

// after edit route_status to in_travel (click start the travel)
// then send noti to their passenger
editRouteInTravel = function (routeid, route, callback) {
    // get request by route_id (array of request is data2)
    Req.getRequestByRouteId(routeid, function (err, data2) {
        var count = 0;
        var page = 0,
        lastPage = data2.length-1;

        async.whilst(function () {
          return page <= lastPage;
        },
        function (next) {
            if (data2[page].req_status == 'accepted') {
                // send noti to alert passenger
                Nor.sendNotiWhenStart(data2[page].passenger_id, route.driverName);  
                count++;
            }
            if (page == lastPage) {
            }
            page++;
            next();
        },
        function (err) {
            // All things are done! 
            console.log('send notification to ' + count + ' passenger');
            callback('send notification to ' + count + ' passenger');
        });
    });
}

// after edit route_status to arrived (click arrived)
// then send noti to their passenger that missed the travel
editRouteArrived = function (routeid, route, callback) {
    // get request by route_id (array of request is data2)
    Req.getRequestByRouteId(routeid, function (err, data2) {
        var page = 0,
        lastPage = data2.length-1;

        async.whilst(function () {
          return page <= lastPage;
        },
        function (next) {       
        let pass_id = data2[page].passenger_id; 
            if (data2[page].req_status == 'accepted') {
                // change req_status to 'cancel'
                Req.updateRequest(data2[page].request_id, {'req_status': 'cancel'}, function(err, result) {
                    if (err) { console.error(err); }
                    else {
                        console.log("change req_status to \'cancel\' succes")
                        console.log(pass_id)
                        // send noti to tell passenger
                        Nor.sendNotiToWhoMissTravel(pass_id, route.driverName);
                    }
                });
            }
            if (data2[page].req_status == 'in_travel') {
                // change req_status to 'cancel'
                Req.updateRequest(data2[page].request_id, {'req_status': 'arrived', 'date.get_out': route.arrived}, function(err, result) {
                    if (err) { console.error(err); }
                    else {
                        console.log("change req_status to \'arrived\' succes")          
                        Nor.sendNotiToWhoInTravel(pass_id, route.driverName);
                    }
                });
            } 
            if (page == lastPage) {
            }
            page++;
            next();
        },
        function (err) {
            // All things are done! 
            console.log('update route_status and req_status success');
            callback('update route_status and req_status success');
        });
    });
}


///////////////////////////////////////////////////////////////////////////////
////////////////////////(END)use in edit route(END)////////////////////////////
///////////////////////////////////////////////////////////////////////////////

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

//get all requests
app.get('/request/all', function (req, res) {
    Req.getAllRequests(function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get requests by request_id
app.get('/request/requestid/:requestid', function (req, res) {
    Req.getRequestByRequestId(req.params.requestid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get requests by route_id
app.get('/request/routeid/:routeid', function (req, res) {
    Req.getRequestByRouteId(req.params.routeid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get requests by passenger_id
app.get('/request/passengerid/:passengerid', function (req, res) {
    Req.getRequestByPassengerId(req.params.passengerid, function (err, data) {
        if (err) { console.error(err); }
        else { 
            // data is array of all request (each passenger)
            var page = 0,
            lastPage = data.length-1;
            var result = [];
            async.whilst(function () {
                return page <= lastPage;
            },
            function (next) {
                let request = data[page];
                Rou.getRouteByRouteId(request.route_id, function(err, routedata) {
                    if (routedata.route_status == 'ready' || routedata.route_status == 'in_travel') {
                        result = {request, routedata};
                        console.log(result);
                    }
                    else {
                        console.log('no current request');                            
                    }
                    if (page == lastPage) {
                    }
                    page++;
                    next();
                });
            },
            function (err) {
                // All things are done!    
                if (result.length == 0) {
                    res.json('no current request');                         
                }   
                else {
                    res.json(result);                             
                }    
            });
        }
    });
});

//get requests that arrived of a route by route_id
app.get('/request/history/routeid/:routeid', function (req, res) {
    Req.getRequestByRouteIdAndArrived(req.params.routeid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get requests that req_status == 'waiting', 'accepted', 'cancel' of a route by route_id
app.get('/request/statusfilter/routeid/:routeid', function (req, res) {
    Req.getRequestByRouteIdAndStatus(req.params.routeid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get request for history page (passenger)
app.get('/request/history/passengerid/:passengerid', function (req, res) {
    Req.getRequestForHistoryP(req.params.passengerid, function (err, data) {
        if (err) { console.error(err); res.json(err); }
        else { 
            // console.log(data); 
            var result = [];
            var page = 0,
                lastPage = data.length-1;

            async.whilst(function () {
              return page <= lastPage;
            },
            function (next) {
              Rou.getRouteByRouteId(data[page].route_id, function(err, data2) {
                if (data2.route_status == 'arrived') {
                    result.push(data[page]);
                }
                else {
                        console.log('no request history');                            
                    }
                if (page == lastPage) {
                }
                page++;
                next();
              });
            },
            function (err) {
                // All things are done!
                if (result.length == 0) {
                    res.json('no request history');                         
                }   
                else {
                    res.json(result);                             
                }  
            });
        }
    });
});

//not use
//insert new request
// app.post('/request/newrequest', function (req, res) {
//     var request = req.body;
//     Req.addRequest(request, function(err, data) {
//         if (err) { console.error(err); res.send(err.toString()); }
//         else { 
//             Req.updateTimestamp(data.request_id, function(err, data) {
//                 console.log('updated timestamp');
//             });
//             console.log('Added request no.' + data.request_id); 
//             res.json(data.request_id); 
//         }
//     });
// });

//update request by request_id
app.put('/request/editrequest/:requestid', function (req, res) {
    var requestid = req.params.requestid;
    var request = req.body;

    Req.getRequestByRequestId(requestid, function (err, cur_req) {
        console.log(cur_req.req_status);
        Req.updateRequest(requestid, request, function(err, data){
            if (err) { console.error(err); res.send(err.toString()); }
            else { 
                if (request.req_status == 'cancel' && cur_req.req_status == 'accepted') {
                    Rou.decrementCurrentSeat(request.route_id, function (err, result) {
                        if (err) { console.error(err); res.send(err.toString()); }
                        else if (result != 'empty') {
                            console.log('decreased current_seat by 1');

                            Nor.sendNotiWhenRequestCancel(request.driver_id, request.passengerName);
                            console.log('decrease seat and send notification succes');
                            res.json('decrease seat and send notification succes');
                        
                        }
                        else {
                            console.log(result); 
                            res.json(result);                         
                        }
                    });
                }
                // new added (when psg cancel request with waiting status)
                else if (request.req_status == 'cancel' && cur_req.req_status == 'waiting') {
                    Nor.sendNotiWhenCancel(request.driver_id, request.passengerName);
                    console.log(data); 
                    res.json(data); 
                }
                //new added (when psg click 'get in' btn)
                else if (request.req_status == 'in_travel' && cur_req.req_status == 'accepted') {
                    Req.updateRequest(requestid, {'date.get_in': request.get_in}, function(err, res) {
                        console.log(res);
                    });
            Nor.sendNotiToGetCurLo(request.driver_id);
                    console.log(data); 
                    res.json(data); 
                }
                else {
                    console.log(data); 
                    res.json(data); 
                }          
            }
        });
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
// for admin only!!!
//----------------------------------------------------------------------------

//get all admins 
app.get('/admin/all', function (req, res) {
    Adm.getAdms(function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//get on admin by adm_id
app.get('/admin/id/:admid', function (req, res) {
    Adm.getAdmById(req.params.admid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//get admin by username
app.get('/admin/username/:username', function (req, res) {
    Adm.getAdmByUserame(req.params.username, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//insert new admin
app.post('/admin/newadmin', function (req, res) {
    var adm = req.body;
    Adm.addAdm(adm, function(err, data) {
        if (err) { console.error(err); res.send(err.toString()); }
        else { 
            console.log('Added admin account no.' + data.adm_id); 
            res.json('Added admin account no.' + data.adm_id); 
        }
    });
});

//update user by adm_id
app.put('/admin/editadmin/:admid', function (req, res) {
    var admid = req.params.admid;
    var adm = req.body;
    Adm.updateAdm(admid, adm, function(err, data){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});

//delete admin by adm_id
app.delete('/admin/removeadmin/:admid', function (req, res) {
    var admid = req.params.admid;
    Adm.removeAdm(admid, function(err, result){
        if (err) { console.error(err); res.send(err.toString()); }
        else if (result.result.n === 0) { 
            console.log('No admin account data to remove'); 
            res.send('No admin account data to remove'); 
        }
        else { 
            console.log('Removed ' + result + ' : adm_id=' + admid); 
            res.json('Removed ' +  result + ' : adm_id=' + admid); 
        }
    });
});

//for authentication admin
app.post('/admin/authen', function (req, res) {
    var adm = req.body;
    Adm.authenAdm(adm, function (data, err) {
        if (err) { console.error(err); }
        else if (data === null) { console.log('No admin data'); res.json({success:'false'}); }
        else { console.log(data); res.json({success:'true',status:data.status}); }
    });
});


//----------------------------------------------------------------------------
// for current_location only!!!
//----------------------------------------------------------------------------

//get all CurLo 
app.get('/curlo/all', function (req, res) {
    CurLo.getAllCurLo(function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//get CurLo by empid
app.get('/curlo/empid/:empid', function (req, res) {
    var empid = req.params.empid;
    CurLo.getCurLoByEmpId(empid, function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//get latest location by curlo_id
app.get('/curlo/latestlocation/empid/:empid', function (req, res) {
    var empid = req.params.empid;
    CurLo.getLatestLocationByEmpId(empid, function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//insert new CurLo
app.post('/curlo/newcurlo', function (req, res) {
    var curlo = req.body;
    forAddNewCurLo(curlo, function(result, err) {
        if (err) { res.json(err); }
        else { res.json(result); }
    });
});

///////////////////////////////////////////////////////////////////////////////
/////////////////////(START)use in add new fav_route///////////////////////////
///////////////////////////////////////////////////////////////////////////////

forAddNewCurLo = function(curlo, callback) {
    CurLo.addCurLo(curlo, function (err, data){
        if (err) { console.log(err); callback(err.toString()); }
        else { 
            CurLo.updateTimestamp(data.curloid_from_empid, function(err, data) {
                console.log('updated timestamp');
            });
            // res.json(data.curloid_from_empid); 
            console.log('Added current_location no.' + data.curloid_from_empid);         
            callback(data.curloid_from_empid);
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////(END)use in add new fav_route////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//update CurLo by emp_id
app.put('/curlo/editcurlobyempid/:empid', function (req, res) {
    var empid = req.params.empid;
    var curlo = req.body;
    CurLo.updateCurLoByEmpId(empid, curlo, function(err, data){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});

//delete CurLo by curlo_id
app.delete('/curlo/removecurlo/:curloid', function (req, res) {
    var curloid = req.params.curloid; 
    CurLo.removeCurLo(curloid, function(err, result){
        if (err) { console.error(err); res.send(err.toString()); }
        else if (result.result.n === 0) { 
            console.log('No current_location to remove'); 
            res.send('No current_location to remove'); 
        }
        else { 
            console.log('Removed ' + result + ' : curlo_id=' + curloid); 
            res.json('Removed ' +  result + ' : curlo_id=' + curloid); 
        }
    });
});


//----------------------------------------------------------------------------
// for fav_route only!!!
//----------------------------------------------------------------------------

//get all favroute 
app.get('/favroute/all', function (req, res) {
    FavRou.getAllFavRoute(function (err, data){
        if (err) { console.log(err); }
        else { res.json(data); console.log(data); }
    });
});

//get favroute by emp_id
app.get('/favroute/empid/:empid', function (req, res) {
    FavRou.getFavRouteByEmpId(req.params.empid, function (err, data) {
        if (err) { console.error(err); }
        else { console.log(data); res.json(data); }
    });
});

//insert new favroute
app.post('/favroute/newfavroute', function (req, res) {
    var favroute = req.body;
    forAddNewFavRoute(favroute, function(err, result) {
        if (err) { res.json(err); }
        else { res.json('Added fav_route no.' + result); }
    });
});

///////////////////////////////////////////////////////////////////////////////
/////////////////////(START)use in add new fav_route///////////////////////////
///////////////////////////////////////////////////////////////////////////////

forAddNewFavRoute = function(favroute, callback) {
    FavRou.addFavRoute(favroute, function(err, data) {
        if (err) { console.error(err); callback(err.toString()); }
        else { 
            console.log('Added fav_route no.' + data.favrouteid_from_empid);
            callback(data.favrouteid_from_empid);
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////(END)use in add new fav_route////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//update more Fav_Route 
app.put('/favroute/updatemore/:empid', function (req, res) {
    var empid = req.params.empid;
    var favroute = req.body;
    FavRou.getFavRouteByEmpId(empid, function (err, data) {
        // all data stored in 'data'
        if (err) { console.error(err); res.json(err); }
        else { 
            // get key for check mode to update more fav_route
            Object.keys(favroute).forEach(function(key) {
///////////////////////DRIVER MODE/////////////////////////////////////////////
                if (key === "driver_mode") {
                    let dr_route = data.driver_mode;

                    var page = 0,
                        lastPage = dr_route.length-1,
                        same_count = 0;

                    if (lastPage >= 0) {                   
                        async.whilst(function () {
                          return page <= lastPage;
                        },
                        function (next) {
                            if (dr_route[page].route.route_name == favroute.driver_mode.route.route_name) {
                                same_count += 1;
                            }
                            if (page == lastPage) {
                            }
                            page++;
                            next();
                        },
                        function (err) {
                            // All things are done!
                            if (same_count == 0) {
                                FavRou.updateMoreFavRoute(empid, favroute, function(err, data){
                                    if (err) { console.error(err); res.send(err.toString()); }
                                    else { 
                                        console.log(data); 
                                        res.json(data); 
                                    }
                                });
                            }
                            else {
                                res.json('Cannot insert the same name.'); 
                            }
                        });
                    }
                    else {
                        FavRou.updateMoreFavRoute(empid, favroute, function(err, data){
                            if (err) { console.error(err); res.send(err.toString()); }
                            else { 
                                console.log(data); 
                                res.json(data); 
                            }
                        });                        
                    }
                }
///////////////////////PASSENGER MODE//////////////////////////////////////////
                else if (key === "passenger_mode") {
                    let pa_route = data.passenger_mode;

                    var page = 0,
                        lastPage = pa_route.length-1,
                        same_count = 0;

                    if (lastPage >= 0) {                   
                        async.whilst(function () {
                          return page <= lastPage;
                        },
                        function (next) {
                            if (pa_route[page].route.route_name == favroute.passenger_mode.route.route_name) {
                                same_count += 1;
                            }
                            if (page == lastPage) {
                            }
                            page++;
                            next();
                        },
                        function (err) {
                            // All things are done!
                            if (same_count == 0) {
                                FavRou.updateMoreFavRoute(empid, favroute, function(err, data){
                                    if (err) { console.error(err); res.send(err.toString()); }
                                    else { 
                                        console.log(data); 
                                        res.json(data); 
                                    }
                                });
                            }
                            else {
                                res.json('Cannot insert the same name.'); 
                            }
                        });
                    }
                    else {
                        FavRou.updateMoreFavRoute(empid, favroute, function(err, data){
                            if (err) { console.error(err); res.send(err.toString()); }
                            else { 
                                console.log(data); 
                                res.json(data); 
                            }
                        });                        
                    }
                }
                else {
                    console.log('ccccc');
                }
            });
        }
    });    
});

//update more Fav_Route 
app.put('/favroute/removesomefavroute/empid/:empid', function (req, res) {
    var empid = req.params.empid;
    var favroute = req.body;
    FavRou.removeSomeFavRoute(empid, favroute.mode, favroute._id, function (err, data) {
        if (err) { console.error(err); res.json(err); }
        else {
            console.log('Removed Fav_Route'); 

            FavRou.getFavRouteByEmpId(req.params.empid, function (err, data2) {
                if (err) { console.error(err); }
                else { console.log(data); res.json(data2); }
            });
        }
    });
});

//delete Fav_Route by emp_id
app.delete('/favroute/removefavroute/:empid', function (req, res) {
    var empid = req.params.empid; 
    FavRou.removeFavRoute(empid, function(err, result){
        if (err) { console.error(err); res.send(err.toString()); }
        else if (result.result.n === 0) { 
            console.log('No fav_route data to remove'); 
            res.send('No fav_route data to remove'); 
        }
        else { 
            console.log('Removed ' + result + ' : favroute by emp_id=' + empid); 
            res.json('Removed ' +  result + ' : favroute by emp_id=' + empid); 
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
    Mat.matchingRoute(request.from, request.to, request.gender, request.time, function(result, err){
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
// for send notification process!!!
//----------------------------------------------------------------------------

//not use
//sendnoti
//client have to send 'driver_id' here!
// app.post('/noti', function (req, res) {
//     var request = req.body;
//     Nor.sendnoti(req.body.driverid,req.body.fname, function(result, err){
//         if (err) { 
//             console.error('err');
//         }
//         else { 
//             console.log('send succes');
//             res.send(result);
//         }
//     });
// });

//not use
//client have to send 'passenger_id' here!
// app.post('/notitopass', function (req, res) {
//     var request = req.body;
//     Nor.sendnotitopass(req.body.passengerid,req.body.fname, function(result, err){
//         if (err) { 
//             console.error('err');
//         }
//         else { 
//             console.log('send succes');
//             res.send(result);
//         }
//     });
// });


//----------------------------------------------------------------------------
// for insert request and send noti to driver!!!
//----------------------------------------------------------------------------

//insert request
//send noti to driver
app.post('/request/newrequest', function (req, res) {
    //check route status    
    var request = req.body;
    Rou.getRouteByRouteId(request.route_id, function (err, data){
        if (data.route_status == 'ready'){
            //var request = req.body;
            var req_insert = {
                'route_id': request.route_id,
                'passenger_id': request.passenger_id,
                'origin' : request.origin,
                'destination': request.destination,
                'date': request.date,
                'note': request.note
            }

            Req.addRequest(req_insert, function(err, data) {
                if (err) { console.error(err); res.send(err.toString()); }
                else { 
                    Req.updateTimestamp(data.request_id, function(err, data) {
                        console.log('updated timestamp');
                    });
                    console.log('Added request no.' + data.request_id); 
                    res.json(data.request_id); 
                    
                    //send noti to driver
                    Nor.sendnoti(request.driver_id, request.passengerName); 
                    
                }
            });
        }
        else {
            console.log('Route was canceled'); 
            res.json('Route was canceled');
        }        
    });    
});


//----------------------------------------------------------------------------
// for accept passenger only (from driver mode)!!!
//----------------------------------------------------------------------------

//update request status of request
//send noti to passenger
app.post('/request/acceptpassenger/:requestid', function (req, res) {
    var requestid = req.params.requestid;
    var request = req.body;

    // console.log(request.req_status);
    Req.getRequestByRequestId(requestid, function (err, data) {
        if (err) { console.error(err); }
        else { 
            if (data.req_status == 'waiting') {
                Req.updateRequest(requestid, {'req_status': request.req_status} , function(err, data2){
                    if (err) { console.error(err); res.send(err.toString()); }
                    else { console.log(data2); res.json(data2); }
                });
                
                //send noti to passenger
                Nor.sendnotitopass(request.passenger_id, request.driverName, request.req_status); 

            }
            else {
                console.log('Error, req_status is not \'waiting\''); 
                res.json('Error, req_status is not \'waiting\'');
            }
        }
    });
});

//increment current_seat by route_id
app.get('/route/incrementseat/:routeid', function (req, res) {
    var routeid = req.params.routeid;
    Rou.incrementCurrentSeat(routeid, function(data, err){
        if (err) { console.error(err); res.send(err.toString()); }
        else { console.log(data); res.json(data); }
    });
});

//----------------------------------------------------------------------------

app.listen(port, function() {
    console.log('Starting node.js on port ' + port);
});

module.exports = app;