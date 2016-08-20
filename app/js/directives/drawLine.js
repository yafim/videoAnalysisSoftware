/**
 * Draws a line on the screen
 * 
 * @param  {String}     [description]
 * @return {[type]}     [description]
 *
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.directive('drawLine', function(){
  return {
    restrict: 'E',
    template: '<canvas id="drawLine" class="layerTwo"></canvas>',
    controller: function($scope, $element, $rootScope, $window){

      var canvas = document.getElementById('drawLine');
      var context = canvas.getContext('2d');
      
      $scope.data = [];

      // $scope.data.push({"id":1,"x":232,"y":2,"amount":5});

       $scope.addData = function() {
        // console.log("add data");
          var id = 0;
          if($scope.data.length > 0) {
              id = $scope.data[$scope.data.length-1].id + 1;
          }
          // var p = {id: id, x: $scope.x, y: $scope.y, amount: $scope.amount};
          var p = {id: id, x: $scope.x, y: $scope.y, amount: 6}
          $scope.data.push(p);
          $scope.x = '';
          $scope.y = '';
          $scope.amount = '';
          draw($scope.data);
      };
      
      $scope.removeAll = function(){
        $scope.data = [];
        context.clearRect(0,0,canvas.width,canvas.height);
      }

      $scope.removePoint = function(point) {
        logFile.writeToLogFile(logFile.getClassifierDebug,"Point removed: " + point);
          for(var i=0; i<$scope.data.length; i++) {
              if($scope.data[i].id === point.id) {
                  logFile.writeToLogFile(logFile.getClassifierDebug,"removing item at position: " + i);
                  $scope.data.splice(i, 1);    
              }
          }
          
          context.clearRect(0,0,canvas.width,canvas.height);
          draw($scope.data);
          logFile.writeToLogFile(logFile.getClassifierInfo,"Final data: " + $scope.data);
      }
      
      function draw(data) {
          for(var i=0; i<data.length; i++) {
              drawDot(data[i]);
              if(i > 0) {
                  drawLine(data[i], data[i-1]);
              }
          }
      }
      
      function drawDot(data) {
        // console.log("here");
          context.beginPath();
          context.arc(data.x, data.y, data.amount, 0, 2*Math.PI, false);
          context.fillStyle = "#ccddff";
          context.fill();
          context.lineWidth = 1;
          context.strokeStyle = "#666666";
          context.stroke();  
      }
      
      function drawLine(data1, data2) {
          if ($scope.data.length > 25){
              context.clearRect(0, 0, canvas.width, canvas.height);
              $scope.data = [];
          }
          context.beginPath();
          context.moveTo(data1.x, data1.y);
          context.lineTo(data2.x, data2.y);
          context.strokeStyle = "red";
          context.stroke();
      }

        function removePreviousPath(){
            $scope.removePoint($scope.data[$scope.data.length - 1]);
            console.log($scope.data[$scope.data.length - 1]);
        }

      $('rectangleCanvas').ready(function(){
        // setup
        canvas.width = $(document).width();
        canvas.height = $(document).height();
        context.globalAlpha = 1.0;
        context.beginPath();
        draw($scope.data);    

      });
    }, // end controller

    controllerAs : 'drawLineCtrl'
  };
});