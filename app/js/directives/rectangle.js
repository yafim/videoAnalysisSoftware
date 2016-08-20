/**
 * Draw a rectangle on the screen with the mouse.
 * @param  {String}     [description]
 * @return {[type]}     [description]
 *
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.directive('rectangle', function(){
  return {
    restrict: 'E',
    template: '<canvas id="rectangleCanvas" class="layerTwo"><draw-line></draw-line></canvas>',
    controller: function($scope, $element, $rootScope, $q, sharedProperties, logFile){

      var canvasElement = $element.find('canvas')[0];
    
      var ctx = canvasElement.getContext('2d');

      // Are we drawing?
      var drag = false;
      $scope.isDrawn = false;

      // VARIABLES
      var tempValue = null;
      var dataToSend = null;
      //END VARIABLES

      // Directive communication
      $scope.updateInformation = function(value){
        $rootScope.$broadcast('boxCreated', value);
      } 

      // Clear existing box
      $scope.clearRectangle = function(){
        if (ctx){
          ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
        }
      }

      $scope.clearRectangleByName = function(rect){
        if (ctx){
          logFile.writeToLogFile(logFile.getClassifierInfo,"Clearing rectangle.");
          ctx.clearRect(rect.startX,rect.startY,rect.w,rect.h);
        }
      }

      canvasElement.width = window.innerWidth;
      canvasElement.height = window.innerHeight;


      $element.bind('mousedown', function(event){  
        
          // ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
          $scope.clearRectangle();
          $scope.rect.startX = event.pageX - this.offsetLeft;
          $scope.rect.startY = event.pageY - this.offsetTop;
          drag = true;

      });

      $element.bind('mousemove', function(event){
        if(drag){
          $scope.rect.w = (event.pageX - this.offsetLeft) - $scope.rect.startX;
          $scope.rect.h = (event.pageY - this.offsetTop) - $scope.rect.startY ;

          // console.log(scope.heatmap_currentSecond);

          // ctx.clearRect(0,0,canvasElement.width,canvasElement.height);
          $scope.clearRectangle();
          // draw();
          $scope.draw($scope.rect.startX, $scope.rect.startY, $scope.rect.w, $scope.rect.h);
        } else {
          // reset();
        }
        
      });

      $element.bind('mouseup', function(event){
        $scope.drawing = true;
        // stop drawing
        drag = false;
        //console.log("draw stopped"); // debug
        // console.log("width: " + scope.rect.w);
        // console.log("Height: " + scope.rect.h);
        if ($scope.rect.w != 0 && $scope.rect.h != 0){
          $scope.rect.endX = $scope.rect.startX + $scope.rect.w;
          $scope.rect.endY = $scope.rect.startY + $scope.rect.h;
        } else {
          $scope.rect.endX = null; $scope.rect.endY = null;
        }

        // console.log("(" + endX + "," + endY + ")");

        // rectangle dimensions
        if ($scope.rect.endX || $scope.rect.endY){

          switchValues();

          // Relevant information to update
          dataToSend = {
            rect: $scope.rect,
            video: $scope.video.currentTime
          };

          $scope.updateInformation(dataToSend); // update relevant listeners
          dataToSend = null;

          $scope.rect.w = Math.abs($scope.rect.w);
          $scope.rect.h = Math.abs($scope.rect.h);


          // console.log("recHeight : " +  scope.rect.recHeight); // debug
          // console.log("recWidth : " +  scope.rect.recWidth); // debug
        }
      });


    // Set end time of the box
    $scope.setEndTimeOfBox = function (){
      $scope.rect.endTime = $scope.video.currentTime;
      logFile.writeToLogFile(logFile.getClassifierDebug,"Box end time: " + $scope.rect.endTime);
    }


      function switchValues(){
        if ($scope.rect.endY < $scope.rect.startY){
          tempValue = $scope.rect.endY;
          $scope.rect.endY = $scope.rect.startY;
          $scope.rect.startY = tempValue;

        }
        if ($scope.rect.endX < $scope.rect.startX){
          tempValue = $scope.rect.endX;
          $scope.rect.endX = $scope.rect.startX;
          $scope.rect.startX = tempValue;
        }

        tempValue = null;
      }

      // TODO: Check switch by ref.. avoid re-writing code.
      function switchValuesByRef(valueOne, valueTwo){
        logFile.writeToLogFile(logFile.getClassifierInfo,"=== Switching Values ===");
        tempValue = valueOne;
        valueOne = valueTwo;
        valueTwo = tempValue;
        tempValue = null;
      }

      var deferred = $q.defer();
      //TODO: 1.change method to draw(startX, startY, width, height){} - done
      //      2. let the user choose the color of the box
      // function draw(){
      $scope.draw = function(startX, startY, w, h){
        // return drawM(startX, startY, w, h);
        
        var promise = drawM(startX, startY, w, h);
        promise = deferred.promise.then(updateDrawnRectanglesIndexes);
      }

      // convert a hexidecimal color string to 0..255 R,G,B
      //TODO: Apply changes when box color changed again.
      function hexToRGB(hex) {
          var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          } : null;
      }


      function drawM(startX, startY, w, h){
        // console.log("draw canvas"); // debug
        //TODO: listener for changes
        var boxColor = hexToRGB(sharedProperties.getBoxColor());

        ctx.fillStyle = "rgba(" + boxColor.r + "," + boxColor.g + "," + boxColor.b + ",0.5)";
        ctx.fillRect(startX, startY, w, h);

        // console.log(deferred);
        return deferred.resolve();
      }

      function updateDrawnRectanglesIndexes(){
        // console.log("P");
        // alert("12");
      }

      // Check if the drowned rectangle intersects with other rectangle position. 
      $scope.checkIntersection = function(rectangle){
        var subRectangle = [];

        // var subRectangle.startX, subRectangle.startY, subRectangle.endX, subRectangle.endY; 
        var isIntersect;

        // X direction intersection
        var horizontalInt = $scope.rect.startX > rectangle.startX && $scope.rect.startX < rectangle.endX;
        // Y direction intersection
        var verticalInt = $scope.rect.startY > rectangle.startY && $scope.rect.startY < rectangle.endY;

        // Get sub rectangle dimentions
        if (horizontalInt){
          //todo: make this logic more simple and readble
          if ($scope.rect.endX > rectangle.endX){
            subRectangle.startX = rectangle.endX;
            subRectangle.endX = $scope.rect.endX;
            subRectangle.w = Math.abs(subRectangle.endX - subRectangle.startX);
          }
          else {
            subRectangle.w = $scope.rect.w;  
          }
        }

        if (verticalInt){
          // subRectangle.startY = $scope.rect.startY;
          // subRectangle.endY = ($scope.rect.h < rectangle.h) ? $scope.rect.h : rectangle.h;
          if ($scope.rect.endY > rectangle.endY){
            subRectangle.startY = rectangle.endY;
            subRectangle.endY = $scope.rect.endY;
            subRectangle.h = Math.abs(subRectangle.endY - subRectangle.startY);
          }
          else {
            subRectangle.h = $scope.rect.h;  
          }

        }
        var x = subRectangle.startX == undefined;
        var y = subRectangle.startY == undefined;
        logFile.writeToLogFile(logFile.getClassifierDebug,"X : " + x);
        logFile.writeToLogFile(logFile.getClassifierDebug,"Y : " + y);

        fullIntersection = x && y;
        console.log(fullIntersection);

        if (!fullIntersection){
         // createSubRectangle($scope.rect.startX, $scope.rect.startY, subRectangle.endX, subRectangle.endY);
          $scope.rect.subRectanglesToDelete.push(subRectangle);
          console.log($scope.rect.subRectanglesToDelete);
        }
        return !fullIntersection;
      }


      //TODO: merge with draw()
      $scope.drawExistingCanvas = function (startX, startY, w, h){
        if (!$scope.isDrawn){
          console.log("drawTest canvas"); // debug
          alert("error! drawExistingCanvas in rectangle.js");
          ctx.fillStyle = "rgba(255,50,50,0.5)";
          ctx.fillRect(startX, startY, w, h);

          $scope.isDrawn = true;
        }
      }
    }, // end controller

    controllerAs : 'rectangleCtrl'
  };
});