/**
 *
 * 
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */

var app = angular.module('pageHolder', [
  'ngRoute',
  'ngContextMenu',
  'ui.bootstrap',
  'googlechart',
  'ngDialog'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  var path = "views/partials/";

  $routeProvider
    // Home
      .when("/", {templateUrl: path + "main.html", controller: "MainCtrl"})
    // Pages
    .when("/video", {templateUrl: path + "video.html", controller: "VideoCtrl"})
    .when("/statistics", {templateUrl: path + "statistics.html", controller: "StatisticsCtrl"})
    // Will not get here...
    .otherwise({templateUrl: path + "404.html", controller: "VideoCtrl"});
}]);


/**
 * Share variables between controllers.
 */
app.service('initializeSettings', function ($q, $rootScope, sharedProperties, logFile) {
  var content;
  var settingsLoaded = sharedProperties.getSettingsLoaded();
  var settingsFile;
  var deferred = $q.defer();

  // Initialize settings from file and return promise.
  function initSettings(){
    var properties = content.split("\n");
    for(var property in properties){
      var key = properties[property].split("=")[0];
      var value = properties[property].split("=")[1];
      logFile.writeToLogFile(logFile.getClassifierInfo,"Initialized: " + key + " set with " + value);
      switch(key){
        case 'precision':
          sharedProperties.setPrecision(value);
          break;
        
        case "boxColor":
          sharedProperties.setBoxColor(value, true);
          break;
          
        case "directory":
            sharedProperties.setScreenshotsDirectoryPath(value);
            break;
      }
    }
    return deferred.resolve();
  }


  /**
   * Read settings file and fire event after that.
   * @param  {String} setting file
   * @return {[type]}
   */
  function readSettingsFile(settingsFile){
    require('fs').readFile(settingsFile, 'utf8',function (err, data) {
      if (err) throw err;
      content = data.replace(/ /g,'');
      //logFile.writeToLogFile(logFile.getClassifierInfo,"Got settings file: " + content);
      var promise = initSettings();
      promise = deferred.promise.then(settingsFileReadyEvent);
      sharedProperties.setSettingsLoaded(true);
      logFile.writeToLogFile(logFile.getClassifierInfo,"Settings file is ready. ");
    });
  }

  /**
   * Dispatch event 'settings file ready'.
   * @return {[type]}
   */
  function settingsFileReadyEvent(){
    $rootScope.$broadcast('settingsFileReady');
    logFile.writeToLogFile(logFile.getClassifierInfo,"SettingsFileReadyEvent---Service");
  }

  return {
    applySettings: function(settingsFile){
      readSettingsFile(settingsFile);
    }
  };

});

/**
 * Share variables and functions between controllers.
 * Contains mostly setter and getters
 * @param  {[type]}
 * @return {[type]}
 */
app.service('sharedProperties', function () {
  // Some private variables
  var videoPath = '';
  var listOfRectangles = '';
  var logFile = '';
  var lock = false;
  var boxColor = {r: 255, g: 50, b: 50};

  var precision;
  var boxColor;
  var directory;
  var settingsLoaded = false;

  /**
   * Get current time and date for the log file.
   * @return {String} time stamp
   */
  function getCurrentTime(){
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();
    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    return "[" + curr_date + "/" + curr_month + "/" + curr_year + " " + time + "]";
  }
      return {
        /**
         * @return {String} video path
         */
        getVideoPath: function () {
            return videoPath;
        },
        /**
         * @param {String} video path
         */
        setVideoPath: function(value) {
            videoPath = value;
        },
        /**
         * @return {Array} list of drawn rectangles
         */
        getListOfRectangles: function () {
            return listOfRectangles;
        },
        /**
         * list of drawn rectangles
         * @param {Array}
         */
        setListOfRectangles: function(value) {
            listOfRectangles = value;
        },
        /**
         * @return {String} log file with eye data
         */
        getLogFile: function(){
          return logFile;
        },
        /**
         * @param {String} log file with eye data
         */
        setLogFile: function(value){
          logFile = value;
        },

        // getLock: function(){
        //   return lock;
        // },
        // setLock: function(value){
        //   lock = value;
        // },
        /**
         * @param {int} Precision of the drawn eye data
         */
        setPrecision: function(value){
          precision = value;
        },
        /**
         * @return {int} Precision of the drawn eye data
         */
        getPrecision: function(){
          return parseFloat(precision);
        }, 
        /**
         * @param {String} box color in rgb
         * @param {boolean} if parsed or not
         */
        setBoxColor: function(value, parse){
          if (parse){
            var value = value.replace(/[\r\n]+/g,"");
          }
          boxColor = value;
        },
        /**
         * @return {String} box color in rgb
         */
        getBoxColor: function(){
          return boxColor;
        },
        /**
         * @param {String} path
         */
        setScreenshotsDirectoryPath: function(value){
          directory = value;
        },
        /**
         * @return {String} path
         */
        getScreenshotsDirectoryPath: function(){
          return directory + "\\";
        },
        /**
         * @param {boolean} settings loaded
         */
        setSettingsLoaded: function(value){
          settingsLoaded = value;
        },
        /**
         * @return {boolean} settings loaded
         */
        getSettingsLoaded: function(){
          return settingsLoaded;
        }
      };
});

// Service for application log file.
app.service('logFile', function () {

    // Initialize ENUMS for the debug file and save into classifier.
    var arr = ["INFO", "DEBUG", "ERROR", "WARNING"];
    var classifier = setEnum(arr);
    var time = getCurrentTime();

    function getCurrentTime(){
      var d = new Date();
      var curr_date = d.getDate();
      var curr_month = d.getMonth() + 1;
      var curr_year = d.getFullYear();
      var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      return "[" + curr_date + "/" + curr_month + "/" + curr_year + " " + time + "]";
    }

    function setEnum(array) {
      var set = {};
      for (var currentItem in array) {
        var item = array[currentItem];
        set[item] = "[" + item + "]";
      }
      return set;
    }

    function newLogString(classifier){
      var line1 = classifier + time + "\n\r" +
                  classifier + time + " ***************************   \n\r" +
                  classifier + time + " ******  New Log File ******   \n\r" +
                  classifier + time + " ***************************   \n\r" +
                  classifier + time + "\n\r";
      return line1;
    }

        return {
           
           // Getters for clasifier - starts the functions when called to get the classifier type.
            getClassifierInfo: function(){ // TODO Change to log.DEBUG.
              return classifier.INFO;
            }(),
            getClassifierDebug: function(){
              return classifier.DEBUG;
            }(),
            getClassifierError: function(){
              return classifier.ERROR;
            }(),
            getClassifierWarning: function(){
              return classifier.WARNING;
            }(),
           
            // Write to log file according to classifier.
            writeToLogFile: function(classifier, data){
             var time = getCurrentTime();
              require('fs').appendFile("./logs/log.txt",classifier + "   " + 
                time + "    " + data + '\r\n', function (err) {
                if (err) {
                  console.log("log file error: " + err); // TODO - create folder if does not exist.
                  throw err;
                } 
                  //console.log("Writing to log file: " + classifier + " " + data);
              });
            },
            initLog: function(classifier){
             var newFileString = newLogString(classifier);
              
             // Init the log file from the newLogString format above.
             require('fs').appendFile("./logs/log.txt",newFileString , function (err) {
                if (err) {
                  console.log("log file error: " + err); // TODO - create folder if does not exist.
                  throw err;
                } 
                  //console.log("Initiating log: " + classifier + " ");
              });
            }
        };
});

app.controller('MainCtrl', function ($scope, initializeSettings, $timeout, sharedProperties, logFile) {
  $scope.alert = function(){
      alert("on");
  };

  logFile.initLog(logFile.getClassifierInfo);
  var settingsLoaded = sharedProperties.getSettingsLoaded();
  var settingsFile;

  // Do some actions when main page loaded.
  $timeout(function(){
    logFile.writeToLogFile(logFile.getClassifierInfo,"Reading settings file.");
    if (!settingsLoaded){
      settingsFile = './configurations/settings/default_settings';
      // readSettingsFile(settingsFile);/
      initializeSettings.applySettings(settingsFile);
      logFile.writeToLogFile(logFile.getClassifierInfo,"Settings initialized");
    }
  });

});

/**
 * Controls all other Pages
 */
app.controller('VideoCtrl', 
  function ($sce, $scope, $location, $http, $route, $window, $q, sharedProperties, logFile) {
    
    window.addEventListener("videoFileLoaded", onVideoFileLoaded, false);

    // Handle videofileloaded event. 
    function onVideoFileLoaded(){
      $scope.setVideo();
      $scope.video.src = $scope.path;
    }

    // Take screenshot of the current session.
    $scope.takeSnapshot = function() {
      var gui = require('nw.gui');
      var win = gui.Window.get();
      var date = new Date();

      win.capturePage(function(buffer){
        var directory = sharedProperties.getScreenshotsDirectoryPath();
          require('fs').writeFile(directory + date.getTime() + '.png', buffer, function (err) {
              if (err) {
                // throw err;
                logFile.writeToLogFile(logFile.getClassifierInfo, err);
                alert("No such directory."); 
              }

              logFile.writeToLogFile(logFile.getClassifierInfo,'Screenshot is saved.');
          });

      }, { format : 'png', datatype : 'buffer'} );
    }

    $scope.updatePath = function (path){
       sharedProperties.setVideoPath(path);
    }

    $scope.setVideo = function(){
      var p = sharedProperties.getVideoPath();
      $scope.path = $sce.trustAsResourceUrl(p);
    }

    // Init video object in scope
    $scope.video = document.getElementById("videoBg");
    $scope.seekBar = document.getElementById("seekBar");
    $scope.playPauseButton = document.getElementById("playPauseButton");
    $scope.loadLogFile = document.getElementById("loadLogFile");
    $scope.volumeSeekBar = document.getElementById("volumeSeekBar");


    // List of rectangles
    $scope.listOfRectangles = [];
    $scope.rect = {};
    $scope.endTime = {};


    // Change form fields
    $scope.updateBoxFields = function(){    
      console.log("This is the box color's");
      console.log(sharedProperties.getBoxColor());
      logFile.writeToLogFile(logFile.getClassifierDebug,"Form has changed");

      // If duration was changed
      if ($scope.endTime.duration){
        $scope.updateEndTime();
      }
    };

    function splitVideoTime(videoTimeInSeconds){
      abs_videoTimeInSeconds = Math.floor(videoTimeInSeconds);
      console.log(abs_videoTimeInSeconds);

      videoSeconds = abs_videoTimeInSeconds % 60;
      videoMilliSec = videoTimeInSeconds.toString().split('.')[1] | 0;
      videoMinutes = (abs_videoTimeInSeconds - videoSeconds) / 60;
    }

    function setValuesInContextMenu(){
        $scope.endTime.minutes = videoMinutes;
        $scope.endTime.seconds = videoSeconds;
        $scope.endTime.milli = videoMilliSec;
    }

    $scope.updateEndTime = function(isSeekbarChanged){
        // Get wanted time in seonds
        if (isSeekbarChanged){
          $scope.jumpTo = parseFloat($scope.video.currentTime);
        }
        else {
          $scope.jumpTo = parseFloat($scope.endTime.duration) + parseFloat($scope.video.currentTime);
        }

        // Parse seconds.
        splitVideoTime($scope.jumpTo);

        // Update context menu fields
        setValuesInContextMenu();
        logFile.writeToLogFile(logFile.getClassifierDebug,"Form values are updated");

        // Update seekbar
        if (!isSeekbarChanged){
          $scope.updateSeekbar();
        } else {
          setDuration();
        }

        $scope.setEndTimeOfBox();
    }

    function setDuration(){
      var duration = $scope.video.currentTime - $scope.rect.startTime;
      // console.log($scope.seekBar.value - $scope.rect.startTime);
      if (duration < 0){
        document.getElementsByName("submit")[0].disabled = true;
        document.getElementsByName("submit")[0].style.backgroundColor = '#707070';
        sendErrorMessage();
        return;
      }

      document.getElementsByName("submit")[0].disabled = false;
      document.getElementsByName("submit")[0].style.backgroundColor = "";
      setBackgroundColor(document.getElementsByName("timeField"), "#fff");
      $scope.errorMessage = "";
      $scope.endTime.duration = duration;
    }

    function sendErrorMessage(){
      $scope.errorMessage = "Not allowed";
      setBackgroundColor(document.getElementsByName("timeField"), "red");
    }

    function setBackgroundColor(elements, color){
      Array.prototype.forEach.call(elements, function(elm) {
        elm.style.backgroundColor = color;
      });
    }

});

