/**
 * Pre defined messages to the user
 * 
 * @author Yafim Vodkov
 * @copyright Yafim Vodkov
 * @version 1.0b3
 */

var aboutMessage = "This software provides the ability to mark different AOIs within the video and intersect it with collected eye data.";
var howToUseMessage = "1. Load video & eye log file\n2. Play video with/without logs\n3. After finished View->Statistics";
var contactMessage = "Available at:\nifim.vo@gmail.com";
var licenseMessage = "Copyright (c) 2016 Yafim Vodkov & Licensed under the Apache License.";

function alertContactMessage(){
  alertMessage(contactMessage);
}

function alertAboutMessage(){
  alertMessage(aboutMessage);
}

function alertHowToUseMessage(){
  alertMessage(howToUseMessage);
}

function alertLicenseMessage(){
  alertMessage(licenseMessage);
}

function alertMessage(message){
  setTimeout(function() {alert(message);}, 200);
}