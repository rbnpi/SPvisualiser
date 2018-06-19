# SPvisualiser
P5.js visualiser developed for use with Sonic Pi

WIP MORE TO COME

My first foray into using P5.js. Here is what I did:
1. Install node.js  I used `https://nodejs.org/dist/v8.11.3/node-v8.11.3.pkg`
2. Install P5.js      I used ver 0.6.1 and placed the unzipped folder on my Desktop in folder P5
3. inside that folder download `https://github.com/genekogan/p5js-osc`
4. `cd p5js-osc`
5. `npm install`  Note there are some security warnings see `https://github.com/genekogan/p5js-osc/issues/11`
6. leave that terminal window open for use later, and start a second window.
You can run the sketches direct from an editor like Brackets, which is what I use for development.
Or you can install a simple node http-server. Do this in the new terminal window
7. Navigate the new terminal window to your P5 folder and then `sudo npminstall -g http-server`

Before continuing, you need to set up a mechanism to connect the Audio out of Sonic Pi so that it is fed to the default input specified on your computer (in my case a Mac). To do this I used RogueAmoeba's LoopBack utility, together with their SoundSource utility. `https://rogueamoeba.com/` These can both be used for short periods in demo-mode without charge, although I have purchased them. LoopBack was developed from the older SoundFlower and it may be possible to use that instead. Try this version `https://github.com/mattingalls/Soundflower/releases/`

In my case I set up a loopback virtual device with Sonic Pi as its default audio source, selected that as the default input AND output. That feeds Sonic Pi to the default input. To listen to Sonic Pi I then used the Sound Source utility Play-Thru window to patch the loopback device to the built-in Output. YOu can also control all the levels in this window.

7. Having setup the loopback configuration, start Sonic Pi. This uses the current audio settings WHEN IT IS LAUNCHED, so don't change them afterwards. (apart from switching on and off the play-thru which can be done).

8. In the first terminal window type `node bridge.ps`
8. start the http server in the second window by typing `http-server`
9. start a browser. Preferred is Chrome, but I have also tried Firefox and Safari
10. go to `http://127.0.0.1:8080`
11. You should see a listing of the contents of your P5 folder
12. Click on the link for `SPtest`
13. If you see a popup asking for permission to link to your microphone, assent.
14. Load the Sonic Pi program SPVisulaserTest.rb from the SPtest folder into Sonic Pi and start it running.
