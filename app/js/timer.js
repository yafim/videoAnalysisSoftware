/**
 * 
 * 
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */
function getPrefix() {
  var prefix = null;
  if (window.performance !== undefined) {
    if (window.performance.now !== undefined)
      prefix = "";
    else {
      var browserPrefixes = ["webkit","moz","ms","o"];
      // Test all vendor prefixes
      for(var i = 0; i < browserPrefixes.length; i++) {
        if (window.performance[browserPrefixes[i] + "Now"] != undefined) {
          prefix = browserPrefixes[i];
          break;
        }
      }
    }
  }
  return prefix;
}

function getTime() {
  return (prefix === "") ? window.performance.now() : window.performance[prefix + "Now"]();
}

function getGlobalTime(){
  return mTime;
}

var prefix;
var mTime;
$(document).ready(function(){
  prefix = getPrefix();
});