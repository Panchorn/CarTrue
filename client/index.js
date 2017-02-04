var myApp = angular.module('myApp', []);

myApp.controller('MainController',  function($scope, $http) {

  $scope.message = "Hello AngularJS";
	$scope.name = '';

  $http.get("http://localhost:3001/emp/users").then(function(res){
    $scope.employees = res.data;
    console.log(res.data);
  });

  $scope.search = function() {
    if ($scope.name === '') {
      // alert('aaaa');
      $http.get("http://localhost:3001/emp/users").then(function(res){
        $scope.employees = res.data;
        console.log(res.data);
      });
    }
    else {
      $http.get("http://localhost:3001/emp/name/" + $scope.name).then(function(res){
        $scope.employees = res.data;
        console.log(res.data + " --- "+ $scope.name);
      });
    }
  }
});
