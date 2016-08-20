/**
 * Draw heatmap on the screen.
 * 
 * @param  {[type]}          [description]
 * @return {[type]}          [description]
 * 
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.directive('heatMap', ['$http', function($http){
  return {
    restrict: 'E',
    template: '<div container></div>',
    controller: function($scope, $element, $rootScope,sharedProperties, logFile){

      var heatmapContainer = $element.find('div')[0];
      var precision = sharedProperties.getPrecision();
      
      /* BUILD THE JSON */
      $scope.json = [];
      $scope.i = 0;
      $scope.toDraw = [];

      // Drawing
      var rect;
      var counter = 0;
      var startTime;
      var endTime;

      var hTime;
      var vTime;
      var cTime;
      var lastTimeMessured = 0;
      /* END VARIABLES */
      
      $scope.drawnRectanglesIndexes = [];
      
      $element.css({
        position: 'relative',
        border: '1px solid blue',
      });

      // Directive communication
      // Set rectangle only when created
      $scope.$on('boxCreated', function(e, data){
        $scope.rect.startTime = $scope.video.currentTime;
        // console.log("Box start time : " + $scope.rect.startTime);
        // console.log("rect.startX : " + rect.startX);
        // console.log("rect.startY : " + rect.startY);
        // console.log("rect.endX : " + rect.endX);
        // console.log("rect.endY : " + rect.endY);
        // console.log("rect.Width : " + rect.w);
        // console.log("rect.Height : " + rect.h);

      });

      $scope.$on('submitBoxPressed', function(){
        if (!isReadyToSubmit()){
          alert("Please fill all the fields");
          return;
        }
        // console.log('submit box pressed'); // debug
        $scope.rect.isDrawn = false;
        $scope.rect.counter = 0;
        $scope.rect.id = $scope.listOfRectangles.length;
        $scope.rect.subRectanglesToDelete = [];

        checkIntersectionWithOtherRectangles();

        addToListOfRectangles();
        $scope.updateSeekbar();

        // add to shared variables
        sharedProperties.setListOfRectangles($scope.listOfRectangles);

        //TODO: Change logic
        $scope.$emit('boxIsReady', $scope.rect);
        logFile.writeToLogFile(logFile.getClassifierInfo,"====== Box Created ======");
        resetBox();
      });

      $scope.$on('cancelBoxPressed', function(){
        // console.log('submit box pressed'); // debug
        resetBox();

      });

      $scope.$on('clearRectangle', function(){
        $scope.clearRectangle();
      });
      //END Directive communication

      // Create heatMap instance
      $scope.heatmapInstance = h337.create({
        container: heatmapContainer
      });

      /* VIDEO CONTROLLERS */

      // When seekbar changed :
      // 1. Pause the video
      // 2. Update current time
      // 3. Clear previous heatMap state on the screen.
      // 4. Set key
      // 5. Draw current heatmap
      $scope.seekBar.addEventListener('change', function(){
        $scope.video.pause();
        
        // console.log("====== seekbar change ======");
        logFile.writeToLogFile(logFile.getClassifierInfo,"====== seekbar changed ======");

        var seekto = $scope.video.duration * ($scope.seekBar.value / 100);
        $scope.video.currentTime = seekto;
        setClosestHeatmapTimeStamp();

        // Draw relevant rectangles
        drawRectangles();

        if ($scope.drawing){
          $scope.updateEndTime(true);
        }
      },
        false
      );

      // Set $scope.i to the closest heatmap timestamp by second.
      function setClosestHeatmapTimeStamp(){
        $scope.clearScreen();

        if ($scope.json.data){
          var vSecond = Math.floor($scope.video.currentTime).toString();
          var elementPos = $scope.json.data.map(function(x) {return x.second; }).indexOf(vSecond);
          var objectFound = $scope.json.data[elementPos];
          var hSecond = objectFound.second;

          // Iterate from the first second instace we have.
          for (var i = elementPos; hSecond == vSecond;i++){
            $scope.i = i;
            $scope.drawHeatMapFromJSON();
            var hSecond = $scope.json.data[i].second;
          }
        }
      }
      
      // Update seekbar while video is playing and show heatmap every second.
      setInterval(function () {
        //ToDo: change it to listener if changed.
        precision = sharedProperties.getPrecision();
        
        $scope.updateVideoTimer();
        if ($scope.isLoaded || $scope.playWithoutLogFile){
          if ($scope.video.currentTime != 0 && lastTimeMessured != $scope.video.currentTime){
                lastTimeMessured = $scope.video.currentTime;
                var value = (100 / $scope.video.duration) * $scope.video.currentTime;
                $scope.seekBar.value = value;
                if ($scope.toDrawHM){
                  $scope.drawHeatMapFromJSON();
                }
          }
        }
      }, 0);

      // Deep clone object and add it to the listOfRectangles
      function addToListOfRectangles(){
        var clonedObject = {};
        angular.copy($scope.rect, clonedObject);
        $scope.listOfRectangles.push(clonedObject);
        // console.log('cloned'); // debug        
      }

      // Reset box fields
      function resetBox(){
        $scope.drawing = false;

        $scope.rect.subRectanglesToDelete = [];
        $scope.rect.startX = 0;
        $scope.rect.startY = 0;
        $scope.rect.w = 0;
        $scope.rect.h = 0;
        $scope.rect.startTime = -1;
        $scope.rect.endTime = -1;
        $scope.endTime.minutes = 0;
        $scope.endTime.seconds = 0;
        $scope.endTime.milli = 0;
        $scope.rect.isDrawn = false;
        $scope.rect.description = "";
        $scope.endTime.duration = "";

      //  console.log("Reset"); //Debug

      }
      /* END VIDEO CONTROLLERS  */



      // Draws heatmap from JSON based on timestamp.
      $scope.drawHeatMapFromJSON = function(){

        drawRectangles();
        
        // If JSON file exists, go all over the JSON file from givenKey.
        if ($scope.json.data){
          var vSecond = Math.floor($scope.video.currentTime);
          var flag = false;
          var hTime = parseFloat(getTime($scope.json.data[$scope.i].timeStamp));
          var diff = Math.abs(hTime - $scope.video.currentTime);

          flag = ($scope.video.currentTime <= (hTime - precision) || 
          $scope.video.currentTime >= hTime + precision);

          // console.log("VIDEO TIME: " + $scope.video.currentTime);
          // console.log("HeatMap index       : " + $scope.i);
          // console.log("vSecond : " + vSecond);
          // console.log("hSecond : " + hSecond);
          // console.log("$scope.i : " + $scope.i);
          // console.log("Diff : " + diff);

          if (!flag){
            // console.log("Difference : " + diff);
            $scope.drawHeatmapObject([$scope.json.data[$scope.i]]);
            $scope.toDraw.push($scope.json.data[$scope.i]);
            $scope.i++;
            checkIntersectionWithObjects($scope.json.data[$scope.i]);
          }
          else {
            if ($scope.video.currentTime >= parseFloat(hTime) + precision){
              $scope.i++;
              $scope.drawHeatMapFromJSON();
            }
          }
        } // end if json.data validation
      } // end drawHeatMapFromJSON

      // For drawing heatmap from $scope.toDraw
      $scope.drawHeatMapFromObject = function(){
        $scope.heatmapInstance.setData({
          data: $scope.toDraw
        });
      }
      
    $scope.drawHeatmapObject = function(i_Object){  
        $scope.heatmapInstance.setData({
          data: i_Object
          // data: $scope.toDraw
        });
        // console.log("DRAW");
        $scope.toDraw.push($scope.json.data[$scope.i]);

        $scope.x = i_Object[0].x;
        $scope.y = i_Object[0].y;
        $scope.addData();
      }

      // time format 00:00:11.0077644
      function getTime(time){
        if (time != undefined){
          // console.log(time.substring(6));
          return time.substring(6);
        }
        else {
          return "";
        }
      }

      function drawRectangles(){
        var startTime; 
        var endTime;
        var rect;

        for(var r in $scope.listOfRectangles){

          rect = $scope.listOfRectangles[r];
          startTime = rect.startTime;
          endTime = rect.endTime;
          // console.log("StartTime: " + startTime);
          // console.log("EndTime: " + endTime);
          // console.log("VideoTime: " + $scope.video.currentTime);
          if (startTime <= $scope.video.currentTime && endTime >= $scope.video.currentTime){
            if (!rect.isDrawn){
              $scope.draw(rect.startX, rect.startY, Math.abs(rect.w), Math.abs(rect.h));
              rect.isDrawn = true;
              $scope.drawnRectanglesIndexes.push(rect);
            }
          }
          else {
            if (rect.isDrawn) {
              rect.isDrawn = false;
              $scope.drawnRectanglesIndexes.splice(rect,1);
              // console.log("REMOVE");
              if (rect.isIntersect) {
                for(var ir in rect.subRectanglesToDelete){
               //   console.log(rect.subRectanglesToDelete[ir]);
                  $scope.clearRectangleByName(rect.subRectanglesToDelete[ir]);
                }
              } else {
                $scope.clearRectangleByName(rect);
              }
              $scope.drawRectanglesOnScreen();
            }
          }
        }
      }

      $scope.drawRectanglesOnScreen = function(){
        var rect;
        for(var r in $scope.drawnRectanglesIndexes) {
          rect = $scope.drawnRectanglesIndexes[r];
          $scope.SetUpdateListener(rect);
          if (!rect.isDrawn) {
            $scope.draw(rect.startX, rect.startY, Math.abs(rect.w), Math.abs(rect.h));
            rect.isDrawn = true;
          }
        }
      }

      function checkIntersectionWithObjects(){
        var rect;
        i_eyePosition = $scope.toDraw[$scope.toDraw.length - 1];
        // console.log(i_eyePosition);
        for(var r in $scope.drawnRectanglesIndexes) {
          rect = $scope.drawnRectanglesIndexes[r];
          // Count how many times passed the box
          if (i_eyePosition.x > rect.startX && i_eyePosition.x < rect.endX && 
            i_eyePosition.y > $scope.rect.startY && i_eyePosition.y < rect.endY ){
            rect.counter++;
          }
        }
      }

      // TODO: Validate the input and show the user what he forgot to fill in the form.
      // try use "required" option as angularjs official site suggests.
      function isReadyToSubmit(){
        var isValid = (
          $scope.rect.description != undefined &&
          $scope.rect.endTime != undefined && 
          $scope.rect.startTime != undefined && 
          $scope.endTime.duration != undefined 
          );
        return isValid;
      }


      function checkIntersectionWithOtherRectangles(){
        var timeIntersection;

        for(var r in $scope.listOfRectangles){
          rect = $scope.listOfRectangles[r];

          timeIntersection = rect.startTime < $scope.rect.startTime && $scope.rect.startTime < rect.endTime;

          $scope.rect.isIntersect = (timeIntersection) ? $scope.checkIntersection(rect) : false;
          //console.log($scope.rect.isIntersect);
        }
      }

      // delete - only for debug
      $scope.showNumberOfHits = function(){
        console.log("Number of hits: ");
        console.log($scope.listOfRectangles);
      }

    },// end controller
    controllerAs : 'heatmapCtrl'

  }; // end return
}
]); // end directive


