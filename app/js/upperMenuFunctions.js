/**
 * Upper menu functions
 * 
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */

/* General variables */
var gui = require('nw.gui');
var win = gui.Window.get();

var fileToChoose = 'input[type="file"]';
var wasSelected = false;
var file;
var clicked = false;
var callback;

// Open file picker
/**
 * Open file picker.
 * @param  {Funtion} i_callback callback function
 */
var chooseFile = function(i_callback) {	
	callback = i_callback;
	var chooser = document.querySelector(fileToChoose);
	chooser.addEventListener("change",function(evt) {
		if (!clicked){
			clicked = true; 
			file = this.value;
			callback();
		}
	});
	chooser.click();
};

/**
 * Exit the applications
 * @return {[type]} [description]
 */
function exitApplication(){	
	win.on('close', function() {
	this.hide(); // Pretend to be closed already
	//logFile.writeToLogFile(logFile.getClassifierInfo,"App is closing..."); TODO - how to import the log file?
	this.close(true);
	});
	win.close();
}

/**
 * Open existing file
 */
function openExistingFile(){
	chooseFile(fileToChoose, function(){
		console.log(file);
	});
}




