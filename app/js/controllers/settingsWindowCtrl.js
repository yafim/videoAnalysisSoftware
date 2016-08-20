/**
 * Settings window (popup) controller.
 * 
 * @param  {[type]} $scope             [description]
 * @param  {[type]} ngDialog           [description]
 * @param  {[type]} sharedProperties   [description]
 * @param  {[type]} $rootScope         [description]
 * @param  {[type]} initializeSettings [description]
 * @param  {String} logFile            [description]
 * @return {[type]}                    [description]
 * 
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
app.controller('SettingsWindowCtrl', function ($scope, ngDialog, sharedProperties, $rootScope, initializeSettings, logFile) {
	// default values
	//TODO: Get it from log file on startup? set it in sharedProperties?

	var settingsToSave;
	var precision;
	var personalSettingsDirectory = './configurations/settings/personal/';
	var fs = require('fs');
	var directory;
	var defaultSettingsFile = '../default_settings';


	// Initialize settings onload
	function initSettings(){
		precision = sharedProperties.getPrecision();
		// $scope.precisionSeekBar = (precision * 100);
		logFile.writeToLogFile(logFile.getClassifierInfo,"Precision before : " + precision);
		$scope.precisionSeekBar = (precision * 1000);
		logFile.writeToLogFile(logFile.getClassifierInfo,"SeekBar: " + $scope.precisionSeekBar);
		personalSettingsDirectory = './configurations/settings/personal/';
		$scope.boxColor = sharedProperties.getBoxColor();
		logFile.writeToLogFile(logFile.getClassifierInfo,"COLOR: " + $scope.boxColor);
		directory = sharedProperties.getScreenshotsDirectoryPath();
		//console.log("initialized");
	}

	initSettings();
	// console.log(precision);
	// var rgbValue = getRGB(sharedProperties.getBoxColor());
	// $scope.boxColor = rgbToHex(rgbValue[0], rgbValue[1], rgbValue[2]);
	// console.log($scope.boxColor);
	// console.log(rgbToHex(rgbValue[0], rgbValue[1], rgbValue[2]));
	// console.log(directory);
	
	var wasChanged = false;
	// console.log(sharedProperties.getSettingsLoaded);
	
	// Apply changes and exit settings form.
	$scope.save = function () {
		if (document.getElementById("apply").disabled == false){
			$scope.apply();
		}
		ngDialog.close('ngdialog1');
	};

	// Apply changes.
	$scope.apply = function(){
		sharedProperties.setPrecision(precision);
		
		sharedProperties.setBoxColor($scope.boxColor, false);
		
		sharedProperties.setScreenshotsDirectoryPath(directory);
		logFile.writeToLogFile(logFile.getClassifierInfo,"Precision changed to: " + precision);
		logFile.writeToLogFile(logFile.getClassifierInfo,"Color changed to (RGB): " + $scope.boxColor);
		logFile.writeToLogFile(logFile.getClassifierInfo,"Directory changed to: " + directory);
		$scope.disableApplyButton();
	}

	function setSettingsToSave(){
		settingsToSave = "precision = " + precision + "\nboxColor = " + $scope.boxColor + "\ndirectory = " + directory;
	}

	// Close settings form without saving changes.
	$scope.cancel = function () {
		ngDialog.close('ngdialog1');
	};

	$scope.change = function() {
		setPrecision($scope.precisionSeekBar);
		logFile.writeToLogFile(logFile.getClassifierInfo,"Precision after change: " + precision);
		//console.log("There has been a change.");
		$scope.enableApplyButton();
    };

    // Set the drawing precision 
    function setPrecision(value){
    	precision = value / 1000;
    }

    $scope.initDirectoryChooser = function(){
		var screenshotsDirectoryPath = document.getElementById('screenshotsDirectoryPath');
		// console.log(screenshotsDirectoryPath);
		screenshotsDirectoryPath.addEventListener("change",function(evt) {
			directory = this.value;
			
			$scope.enableApplyButton();
		});
    }

    $scope.disableApplyButton = function(){
		document.getElementById("apply").disabled = true;
		document.getElementById("apply").style.backgroundColor="#BFBFBF";
    }

    $scope.enableApplyButton = function(){
		document.getElementById("apply").disabled = false;
		document.getElementById("apply").style.backgroundColor="#3288e6";  
    }

	function rgbToHex(r, g, b) {
    	return "#" + ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
	}

	function getRGB(value){
		var rgbToReturn = "";
		var parsedString = value.replace(/({|})/g, "");
		var numberPattern = /\d+/g;
		return parsedString.match(numberPattern);
	}

	$scope.debugFileSave = function(){
		// setSettingsToSave();
		// setPersonalSettingsFile("newFile");
		// applySettingsFileEvent();
		// initializeSettings.alertFunc();
		// $rootScope.$broadcast('serviceEventTest');

		//console.log("precision : " + precision); // TODO - necessary?
	}

	$scope.saveSettingsFile = function(){
		logFile.writeToLogFile(logFile.getClassifierInfo,"Saving settings file as " + $scope.personalSettingsName);
		setSettingsToSave();
		setPersonalSettingsFile($scope.personalSettingsName);
	}

	// $scope.$on('settingsFileReady', function(event, settingsFile) {
 //    	initSettings();
	// });
	
	$scope.$on('settingsFileReady', function(event, settingsFile) {
    	initSettings();
	});

	// Create new presonal settings file in directory with given name.
	function setPersonalSettingsFile(fileName){
		fs.writeFile(personalSettingsDirectory + fileName, settingsToSave, function (err) {
			if (err) throw err;
				logFile.writeToLogFile(logFile.getClassifierInfo,"Settings file saved in: " 
					+ personalSettingsDirectory + fileName);
		});
	}

	// list all settings files in directory.
	$scope.getSettingsFiles = function(){
		fs.readdir(personalSettingsDirectory, function (err, files) {
			if (err) throw err;
			logFile.writeToLogFile(logFile.getClassifierInfo,"These are the setting files:  " + files);
				$scope.settingsFiles = files;
				$scope.settingsFiles.push(defaultSettingsFile);
		});


	};

	// when item selected from options
	$scope.changeSettings = function(item){
		settingsToSavePath = personalSettingsDirectory + item;
		// console.log("settingsToSavePath : " + settingsToSavePath);
		applySelectedSettings();
	}

	// apply settings from file.
	function applySelectedSettings(){
		initializeSettings.applySettings(settingsToSavePath);
		$scope.enableApplyButton();
	}

	$scope.resetToDefaultSettings = function(){
		//TODO...
	}

	$scope.getSettingsFiles();

});