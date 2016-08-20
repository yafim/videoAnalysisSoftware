/**
 * Utils class
 * 
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */

// Prevent menu item excute function more than once
var menuItem = {
  isLocked: false
};
/**
 * Supported video formats
 * NOTE: There might be more supported files like webmv for IOS.
 */
var supportedVideoFormats = {
  mp4: "mp4"
}

/**
 * Supported log file formats
 */
var supportedLogFileFormats = {
  json: "json"
}


/**
 * Validate file format
 * @param  {String} i_File    file
 * @param  {String} i_Format  format
 * @return {Boolean}          File is supported
 */
function validateFile(i_File, i_Format){
  var fileExt = i_File.split('.').pop();
  // return (fileExt == i_ExpectedExtension);
  var format = getFileFormat(i_Format);
  for(var ext in format){
    if (ext == fileExt){
      return true;
    }
  }
  return false;
}

/**
 * Gte file format
 * @param  {String} i_Format file
 * @return {String}          format
 */
function getFileFormat(i_Format){
  var toReturn = null;
  switch(i_Format){
    case "video":
      toReturn = supportedVideoFormats;
      break;
    case "logFile":
      toReturn = supportedLogFileFormats;
      break;
  }
  return toReturn;
}


/* FULL SCREEN */
/**
 * Set full screen
 * @param  {Object} element dom element
 */
function activateFullscreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
}

/**
 * Exit full screen
 */
function exitFullscreen() {
  if(document.cancelFullScreen) {
    document.cancelFullScreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
}

// check if adblock 
function ads(window){
    if( window.canRunAds === undefined ){
      alert('error: adblocker detected');
  }
}

