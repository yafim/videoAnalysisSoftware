/**
 * This directive creates <video> and loads the selected video file (for this moment we 
 * support only mp4 files). 
 * @param  {String} 				[description]
 * @return {[type]}                 [description]
 *
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.directive('uiVideo',['$http', function($http){
	return {
		template: 
				'<video id="videoBg" class="layerOne" ng-init="setVideo()">' +
				'<source id="mp4" src="{{path}}" type="video/mp4">' +
				'<p>Your user agent does not support the HTML5 Video element.</p>' +
				'</video>',

	    controller: function($scope, $element, $rootScope, sharedProperties, logFile){
			
			/* ERROR MESSAGES */
			var ERR_LOAD_FILE = "Please load file";
			/* END ERROR MESSAGES */

			/* SUCCESS MESSAGES */
			var SUCC_FILE_UPLOADED = "File uploaded successfully";
			/* END MESSAGES */

			/* VARIABLES */
			$scope.playPauseIcon = "M8 5v14l11-7z";
			// styled icons in video.html 
			var playIcon = "M8 5v14l11-7z", pauseIcon = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
			$scope.isLoaded = sharedProperties.getVideoPath() != ""; // check if log file was loaded 
			$scope.playWithoutLogFile = false;
			
			var videoTimeIndicator = document.getElementById("videoTimeIndicator"); //time indicator
			/* END VARIABLES */

			/* Video Option control JQuery function*/
		    $(document).ready(function(){
		    // Dropdown toggle
		      $('#buttonVideoOptions').click(function(){
		        $(this).next('.dropdown').toggle();
		      });

		      // Toggle volume button
		      $('#toggleVolumeRange').click(function(){
		        $(this).next('.dropdown').toggle();
		        var pos = document.getElementById("toggleVolumeRange").getBoundingClientRect().left + 15;
		        document.getElementById("volumeSeekBar").style.left = pos + "px";
		      });
		    });

		    // Update video time indicator
		    $scope.updateVideoTimer = function(){
				if (videoTimeIndicator != null){
					var whereYouAt = $scope.video.currentTime;
					var minutes = Math.floor(whereYouAt / 60);   
					var seconds = Math.floor(whereYouAt % 60);
					var x = minutes < 10 ? "0" + minutes : minutes;
					var y = seconds < 10 ? "0" + seconds : seconds;
					videoTimeIndicator.innerHTML   = x + ":" + y;
				}
		    }

		    // Clear screen state
		    $scope.clearScreen = function(){
		    	$scope.toDraw = [];
		    	$scope.removeAll();
		    	$scope.drawHeatMapFromObject();
		    }

			/* VIDEO CONTROLS */

			// Volume seek bar
			$scope.volumeSeekBar.addEventListener('change', function(){
	        	$scope.video.volume = $scope.volumeSeekBar.value;
		    });

		    window.addEventListener("logFileLoaded", onLogFileLoaded, false);

		    function onLogFileLoaded(){
		    	$scope.playVideoWithLogFile();
		    }

		    $scope.playVideoWithLogFile = function(){
				var fileUrl = sharedProperties.getLogFile();
				// var fileUrl = "./videoLogs/file.json";
				getFileContent(fileUrl);

				$scope.playWithoutLogFile = false;
				$scope.toDrawHM = true;
			}


			// Load log file
			function getFileContent(fileUrl){
				logFile.writeToLogFile(logFile.getClassifierInfo,"file url: " + fileUrl);
				$http.get(fileUrl)
				     .success(function(data){
				    $scope.json = data;
				    alert(SUCC_FILE_UPLOADED);
				   $scope.isLoaded = true; // file loaded  
				}); 
			}

			$scope.playVideoWithoutLogFile = function(){
				$scope.clearScreen();
				$scope.playWithoutLogFile = true;
				$scope.isLoaded = false;

				$scope.toDrawHM = false;
			}

			//TODO: Build this method in c# eye tracker
			function buildDataFromJson(json){
				var data = [];
				for (var obj in json){
					data.push(json[obj]);
				}
				logFile.writeToLogFile(logFile.getClassifierDebug,"Data from JSON: " + JSON.stringify(data));
			}

			$scope.updateSeekbar = function(){
		        $scope.seekBar.value = (100 * $scope.jumpTo) / $scope.video.duration;
		        $scope.video.currentTime = $scope.jumpTo;
	      	}

			// Play and Stop button. Video will be played only if  
			$scope.playPause = function(){
				// if heatmap json file was loaded Continue, Otherwise alert Error Message.
				if ($scope.isLoaded || $scope.playWithoutLogFile){
					if ($scope.video.paused == true) {
						$scope.video.play();
						$scope.playPauseIcon = ($scope.playPauseIcon == playIcon) ? pauseIcon : pauseIcon;
					}
					else {
					    $scope.video.pause();
					    $scope.playPauseIcon = playIcon;
					}
				}
				else {
					alert(ERR_LOAD_FILE);
				}
			}

			angular.element(document).ready(function () {
				$scope.toDrawHM = $scope.playWithoutLogFile || $scope.isLoaded;
			});


		} // end controller
	} // end return
}]);