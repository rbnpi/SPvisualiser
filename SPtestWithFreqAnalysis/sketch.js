//SPtestWithFrequencyAnalysis written by Robin Newman
//Shows interaction between a Sonic Pi program and the sketch
//run Sonic Pi program in this folder after starting the sketch in a browser window
//utilises fundamental anaysis code from https://therewasaguy.github.io/p5-music-viz/demos/06c_autoCorrelation_PitchTrack/

var localIP = '192.168.1.128';  //must use this NOT 127.0.0.1 to allow remote access of TouchOSC to work
var localPort = 12000;
var remoteIP = '192.168.1.128'; //TouchOSC address
var remotePort = 4559;

var cnv; //reference for canvas to allow re-centering
var mic; //references default audio input
var amplitude; //of mic input
var fft;
var preNormalize = true;
var postNormalize = true;
var lowPass;
// center clip nullifies samples below a clip amount
var doCenterClip = false;
var centerClipThreshold = 0.0;
var vol; //holds audio level of input
var vol2; //holds scaled vol
squareScreen=0; //this example use full window, not square aspect
var enableFlag = 0;
var textMessage = '';
var enableLine = 0;
var isConnected; //shows connection state of sketch to send OSC messages
var lh = 0; //dimension for blue squares
var lmax=0; //max level calucluated by Sonic Pi
var tick = 0; //frame counter
volMult = 5000; //scaling factor
var freq; //holds calculated fundamental frequency of input

function setup() {
    cnv=createCanvas(window.innerHeight, window.innerHeight); //setup resizable square window
    centreCanvas();
    colorMode(HSB);
    angleMode(DEGREES);
    setupOsc(localIP,localPort,remoteIP,remotePort); //set address/port  of local machine, and address/port of TouchOSC
    mic = new p5.AudioIn();
    mic.start();
    mic.connect();
    //variables used for fundamental frequency calculation
    lowPass = new p5.LowPass(); 
    lowPass.disconnect();
    mic.connect(lowPass);
    fft= new p5.FFT();
    fft.setInput(lowPass);
    //amplitude from audio input
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
}

function windowResized() {
    if (squareScreen==0){ //in this example don';'t use square screen
        resizeCanvas(windowWidth, windowHeight); //change window width
    }else{
        resizeCanvas(windowHeight, windowHeight); //change window width    
    }
    centreCanvas();
}
function centreCanvas() {
    var xc = (windowWidth - width) / 2;
    var yc = (windowHeight - height) / 2;
    cnv.position(xc, yc);
    console.log("centered"); //debugging message
}

//this function from examples in p5js-osc package
function setupOsc(hostInIP,oscPortIn, hostOutIP,oscPortOut) { //sets up OSC comms.
    socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
    socket.on('connect', function() {
        socket.emit('config', {	
            server: { port: oscPortIn,  host: hostInIP},
            client: { port: oscPortOut, host: hostOutIP}
        });
    });
    socket.on('connect', function() {
        isConnected = true;
    });
    socket.on('message', function(msg) {
        if (msg[0] == '#bundle') {
            for (var i=2; i<msg.length; i++) {
                receiveOsc(msg[i][0], msg[i].splice(1));
            }
        } else {
            receiveOsc(msg[0], msg.splice(1));
        }
    });
}

function sendOsc(address, value) {
    if (isConnected){
        socket.emit('message', [address, value]);
        console.log("message sent");
    }
}

//This function receives and parses OSC messages from Sonic Pi
function receiveOsc(address, value) { 
    console.log("received OSC: " + address + ", " + value);
    if (address == '/showText') { //receive text to display
        textMessage = value[0];
    }
    if (address == '/enableText'){ //enable/disable text display
        if (value[0] == 1) {
            enableFlag = 1;
        } else{
            enableFlag = 0;
        }
    }
    if (address == "/returnData") { //receive data for displaying line, and blue rectangles
        lh = value[0];lmax = value[1]       
    }
    if (address == "/enableLine"){
        if (value[0] == 1){ //line can be enabled or disabled
            enableLine = 1;
        } else {
            enableLine = 0;
        }
    }
}

function draw() { //draws output on the brwoser screen
    tick += 1; //frame counter
    background(0)
    //This section gets fundamental freq of input
    // array of values from -1 to 1
    var timeDomain = fft.waveform(1024, 'float32');
    var corrBuff = autoCorrelate(timeDomain);
    freq = findFrequency(corrBuff);
    //map the frequency to a colour range 0->255 
    var fcol = map(freq,200,550,0,255) //200 and 550 cover the expected input freq range
    //get vol level of input signal
    vol=amplitude.getLevel(); 
    vol2=vol*volMult; //scale it
    translate(width / 2, height / 2); //centre coordinate system
    rectMode(CENTER); 

    fill('blue'); //draw the blue rectangles, size and position set by data from Sonic Pi
    for(var i=0;i<7;i++){
        for(var j=0;j < 7;j++){
            rect( -(3-i)*lmax/2,-(3-j)*lmax/2,lh/2,lh/2 );
        }
    }
    
    fill('red');
    rect(0, 0, lh*2,lh*2); //central rectangle round circle. Size calculated in Sonic Pi   
    strokeWeight(4);
    stroke('red');
    if(enableLine == 1){
        line(-300,-lmax,300,-lmax); //draw current max level line if enabled
    }
    strokeWeight(1);
    if(tick%2 == 0){ //every second frame send current vol2 level to Sonic Pi
        sendOsc("/volValue",[vol2]);
    }
    colorMode(HSB);
    fill(fcol,100,100); //set fill colour dependent upon fundamental frequency
    ellipse(0,0,2*vol2,2*vol2);



   stroke(1);
textSize(28);
    fill('green');
    textAlign(CENTER);
    text("Sonic Pi Visualiser Demonstration by Robin Newman",0,height / 2 - 100);
    fill('red');
    text("This version calculates fundamental frequency of input",0,height / 2 - 60);
    if (enableFlag == 1) { //control whether text is shown from Sonic Pi OSC input
        stroke('black');       
        textSize(24);
        //fill('red');
        
        text(textMessage, 0, -height / 2 + 40) ; //Sonic Pi message
        text('The calculated fundamental frequency sets the circle colour',0, -height / 2 + 160);
        fill('white');
        textAlign(LEFT);
        textSize(22);
        text('Scaled Amplitude: ' + round(vol2*100)/100, -160, -height / 2 + 80);
        text('Max. scaled Amplitude: ' + round(lmax*100)/100, -160, -height / 2 + 100);
        
        text ('Fundamental Frequency: ' + freq.toFixed(2), -160, -height / 2 + 120);
        fill('red');
        
    }
}

// accepts a timeDomainBuffer and multiplies every value
function autoCorrelate(timeDomainBuffer) {

    var nSamples = timeDomainBuffer.length;

    // pre-normalize the input buffer
    if (preNormalize){
        timeDomainBuffer = normalize(timeDomainBuffer);
    }

    // zero out any values below the centerClipThreshold
    if (doCenterClip) {
        timeDomainBuffer = centerClip(timeDomainBuffer);
    }

    var autoCorrBuffer = [];
    for (var lag = 0; lag < nSamples; lag++){
        var sum = 0; 
        for (var index = 0; index < nSamples; index++){
            var indexLagged = index+lag;
            if (indexLagged < nSamples){
                var sound1 = timeDomainBuffer[index];
                var sound2 = timeDomainBuffer[indexLagged];
                var product = sound1 * sound2;
                sum += product;
            }
        }

        // average to a value between -1 and 1
        autoCorrBuffer[lag] = sum/nSamples;
    }

    // normalize the output buffer
    if (postNormalize){
        autoCorrBuffer = normalize(autoCorrBuffer);
    }

    return autoCorrBuffer;
}


// Find the biggest value in a buffer, set that value to 1.0,
// and scale every other value by the same amount.
function normalize(buffer) {
    var biggestVal = 0;
    var nSamples = buffer.length;
    for (var index = 0; index < nSamples; index++){
        if (abs(buffer[index]) > biggestVal){
            biggestVal = abs(buffer[index]);
        }
    }
    for (var index = 0; index < nSamples; index++){

        // divide each sample of the buffer by the biggest val
        buffer[index] /= biggestVal;
    }
    return buffer;
}

// Accepts a buffer of samples, and sets any samples whose
// amplitude is below the centerClipThreshold to zero.
// This factors them out of the autocorrelation.
function centerClip(buffer) {
    var nSamples = buffer.length;

    // center clip removes any samples whose abs is less than centerClipThreshold
    centerClipThreshold = map(mouseY, 0, height, 0,1); 

    if (centerClipThreshold > 0.0) {
        for (var i = 0; i < nSamples; i++) {
            var val = buffer[i];
            buffer[i] = (Math.abs(val) > centerClipThreshold) ? val : 0;
        }
    }
    return buffer;
}

// Calculate the fundamental frequency of a buffer
// by finding the peaks, and counting the distance
// between peaks in samples, and converting that
// number of samples to a frequency value.
function findFrequency(autocorr) {

    var nSamples = autocorr.length;
    var valOfLargestPeakSoFar = 0;
    var indexOfLargestPeakSoFar = -1;

    for (var index = 1; index < nSamples; index++){
        var valL = autocorr[index-1];
        var valC = autocorr[index];
        var valR = autocorr[index+1];

        var bIsPeak = ((valL < valC) && (valR < valC));
        if (bIsPeak){
            if (valC > valOfLargestPeakSoFar){
                valOfLargestPeakSoFar = valC;
                indexOfLargestPeakSoFar = index;
            }
        }
    }

    var distanceToNextLargestPeak = indexOfLargestPeakSoFar - 0;

    // convert sample count to frequency
    var fundamentalFrequency = sampleRate() / distanceToNextLargestPeak;
    return fundamentalFrequency;
}