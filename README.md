# Introduction
This Video player analyzes a JSON file containing coordinates and timestamps (the JSON data corresponds to the frames in a video track - this file will be built in advance using some eyetracker and eye tracking software) to present relevant pixels, according to time, on the screen using heatmap.js.

# Motivation
* Understanding user's viewing/reading behavior (Eye tracking technology, EEG, Cursor behavior, etc.) 

# Requirements
* Create JSON with provided software (./tet/TETWinSamples.sln) - [EyeTribe  GitHub](https://github.com/EyeTribe/tet-csharp-samples)
* Note! You can generate your own json file from any eye tracker using this format (JSON example containing 2 coordinates)

```<JSON>
{
 "data":[
	{
	 "x": 1008,
	 "y": 582,
	 "timeStamp" : "00:00:00.0030017",
	  "second" : "0"
	 },
	{
	 "x": 1008,
	 "y": 580,
	 "timeStamp" : "00:00:00.0230138",
	  "second" : "0"
	 },
	{}
]}
```

# How to use it
* Open the program using provided nwjs version (./nwjs-v0.12.3-win-x64) [NWJS  GitHub](https://github.com/nwjs/nw.js) as follows:
	* From cmd:
	```
	.\nwjs-v0.12.3-win-x64\nw.exe .\app\
	```
* Choose video and json file
* Mark relevant AOIs in the video. 
* Play the video (with log file).
* By clicking on View->Statistics you'll be able to analyse the user's gaze during the video related to the AOIs you chose.


#Some pictures
![pic](https://s4.postimg.org/6a1hl76jx/1471704554496.png)
![pic](https://s4.postimg.org/sgooe2i59/1471704602464.png)
![statistics](https://s4.postimg.org/l1nem0t19/statistics.png)
![heatmap](https://s4.postimg.org/vaxuew659/1471706373029.png)


# Beta disclaimer
Please note that this is a beta version and still undergoing final testing and modifications.

As a user of this beta, you’re invited to join a community of testers, reviewers, and bug-catchers. We're grateful for your help as we develop towards a stable release. We welcome feedback, suggestions, name suggestions, and the identification of flaws, glitches, and bugs.

To report a bug or suggestion, please send email to : ifim.vo@gmail.com / michael.ido@gmail.com	

Thank you again and I hope you enjoy,
Yafim & Ido

# License
Copyright (c) 2016 Yafim Vodkov, Ido Michael & Licensed under the [Apache License](LICENSE.md).
