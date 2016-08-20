/**
 * Navigation bar controller.
 * 
 * @param  {[type]} $scope           [description]
 * @param  {[type]} sharedProperties [description]
 * @param  {[type]} ngDialog         [description]
 * @param  {[type]} logFile        [description]
 * @return {[type]}                  [description]
 *
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.controller('NavbarCtrl', function ($scope, sharedProperties, ngDialog, logFile) {
  var logFileLoaded = document.createEvent("Event");
  var videoFileLoaded = document.createEvent("Event");
  
    // Open new file
  function loadVideoFile(){
        chooseFile(function(){
          if (validateFile(file, "video")){
            //logFile.writeToLogFile(logFile.getClassifierInfo,"Loaded video file: " + file);
            sharedProperties.setVideoPath(file);
            videoFileLoaded.initEvent("videoFileLoaded", true, true);
            document.dispatchEvent(videoFileLoaded);
          } 
          else {
            alert("Bad file format");
          }

        });
        clicked = false;
    }

    // Open log file
  function loadLogFile(){
    chooseFile(function(){  
      // console.log("LOG FILE: " + file);
      sharedProperties.setLogFile(file);
      logFileLoaded.initEvent("logFileLoaded", true, true);
      document.dispatchEvent(logFileLoaded);
    });
    
    clicked = false;
  }

  // Open settings window
  function openSettingsWindow(){
      ngDialog.open({
        template: 'views/partials/settings.html',
        controller: 'SettingsWindowCtrl',
        className: 'ngdialog-theme-default ngdialog-theme-custom'
      });
  }

  // Reset all data
  function resetData(){
    sharedProperties.setListOfRectangles('');
    console.log("Reset");
  }  

  /* File tab */
  $scope.file = [
  {
    name: "New File",
    link: "#"
  }, {
    name: "Open File...",
    link: openExistingFile
  }, 

  {
    name: "Load",
    link: "#",
    subtree: [{
      name: "Video file",
      link: loadVideoFile,
    },{
      name: "Log file",
      link: loadLogFile
      }]
  }, // end load

  {
    name: "divider",
    link: "#"
  }, {
    name: "Save",
    link: "#"
  }, {
    name: "Save As...",
    link: "#"
  },{
    name: "divider",
    link: "#"
  }, {
    name: "Exit",
    link: exitApplication
  }];

  /*Help tab */
    $scope.help = [{
    name: "About",
    link: alertAboutMessage
    },{
    name: "How to use",
    link: alertHowToUseMessage
    }, {
    name: "License",
    link: alertLicenseMessage
    }, {
    name: "Contact",
    link: alertContactMessage
    }
  ];

  /* Preferences */
  $scope.preferences = [{
    name: "Settings",
    link: openSettingsWindow
  }]; 

  /* View */
  $scope.view = [{
    name: "Main Page",
    link: "/"
    },
    {
    name: "Reset data",
    link: resetData
    },
    {
    name: "Statistics",
    link: "/statistics"
    }
  ]; 
  
});

