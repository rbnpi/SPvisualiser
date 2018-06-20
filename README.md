# SPvisualiser
P5.js visualiser developed for use with Sonic Pi

WIP MORE TO COME

THE SOUND INTERFACE STUFF HERE IS SPECIFIC TO MAC. I AM PLAYING WITH GETTING IT GOING ON A RASPBERRY PI WITH PI-SOUND BOARD, BUT HAVEN'T GOT THERE YET.

BREAKING CHANGES. Sketches now located within the SPVisualiser folder which is placed inside the P5 folder so index.html files have been altered to reflect the new location

My first foray into using P5.js. Here is what I did:
1. Install node.js  I used `https://nodejs.org/dist/v8.11.3/node-v8.11.3.pkg`
2. Install P5.js      I used ver 0.6.1 and placed the unzipped folder on my Desktop in folder P5. (see point 9. if yours is different)
3. inside that folder download `https://github.com/genekogan/p5js-osc`
4. `cd p5js-osc`
5. `npm install`  Note there are some security warnings see `https://github.com/genekogan/p5js-osc/issues/11`
6. leave that terminal window open for use later, and start a second window.
You can run the sketches direct from an editor like Brackets, which is what I use for development.
Or you can install a simple node http-server. Do this in the new terminal window
7. Navigate the new terminal window to your P5 folder and then `sudo npminstall -g http-server`

Before continuing, you need to set up a mechanism to connect the Audio out of Sonic Pi so that it is fed to the default input specified on your computer (in my case a Mac). To do this I used RogueAmoeba's LoopBack utility, together with their SoundSource utility. `https://rogueamoeba.com/` These can both be used for short periods in demo-mode without charge, although I have purchased them. LoopBack was developed from the older SoundFlower and it may be possible to use that instead. Try this version `https://github.com/mattingalls/Soundflower/releases/`

In my case I set up a loopback virtual device with Sonic Pi as its default audio source, selected that as the default input AND output. That feeds Sonic Pi to the default input. To listen to Sonic Pi I then used the Sound Source utility Play-Thru window to patch the loopback device to the built-in Output. You can also control all the levels in this window.

8. Having setup the loopback configuration, start Sonic Pi. This uses the CURRENT audio settings WHEN IT IS LAUNCHED, so don't change them afterwards. (apart from switching on and off the play-thru which can be done).

9. Clone or download this repository to your computer, inside the top level of your p5 folder. The sketches should be run form this position as paths within index.html files depend on this location. Also the absolute path to the sonic-piweb-logoTR.png file referenced in the visualiser/sketch.js file, and the `boleroSample folder` absolute location is also referenced in the `visualBolero-RF.rb` file 
  
10. In the first terminal window type `node bridge.ps`
11. start the http server in the second window by typing `http-server`
12. start a browser. Preferred is Chrome, but I have also tried Firefox and Safari
13. go to `http://127.0.0.1:8080`
14. You should see a listing of the contents of your P5 folder
15. Navigate to `SPvisualiser/SPtest`
16. If you see a popup asking for permission to link to your microphone, give permission.
17. Load the Sonic Pi program `SPVisualiserTest.rb` from the `SPtest` folder into Sonic Pi and start it running.

You can use the back arrow on your browser and select  SPtestWithFreqAnalysis to try out this version. (This uses the same Sonic Pi program as SPtest). 

The third example SPvisualDisplay is highly configurable via OSC controlled settings. A block of code can be added in Sonic Pi to various existing programs to enable them to be run with visual support. The example can also be interfaced to TouchOSC which can also control about 50 different settings, and can be used to do so in real time. There are six sample Sonic Pi programs to try with this sketch. The file sampleOSCcontrol.rb give some inditcation of how to build others. Note the file visualBolero-RF.rb should be run in Sonic Pi using the run_file command. To do this, type run_file in an empty Sonic Pi buffer, then drag the icon of the file into the Sonic Pi buffer and it will automatically add the pathname for you.

If you have purchased TouchOSC from `hexler.net`the TouchOSC template is the file `p5jsVisualiser.touchosc` which can be uploaded to TouchOSC on a tablet using the TouchOSC editor. A screenshot of the editor is the file `TouchOSCimage.jpeg`. A separate document will give some details.
