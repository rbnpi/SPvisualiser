//sketch by Robin Newman, June 2018
//used in conjunction with Sonic Pi 3 runing on the same computer
//Also requires p5js-osc to be installed, and node bridge.js to be running from that package

var localIP = '127.0.0.1';  //must use actual IP NOT 127.0.0.1 to allow remote access to work eg Touch OSC
var localPort = 12000;
var remoteIP = '127.0.0.1'; //Address to which OSC messages are sent
var remotePort = 4559;

var cnv; //reference for canvas to allow re-centering
var mic; //references default audio input
var amplitude; //of mic input
var vol; //holds audio level of input
var vol2; //holds scaled vol
squareScreen=0; //sets Screen aspect ratio. Square not used in this example
var enableFlag = 0;
var textMessage = '';
var enableLine = 0;
var isConnected; //shows connection state of sketch to send OSC messages
var lh = 0; //dimension for blue squares
var lmax=0; //max level calucluated by Sonic Pi
var tick = 0; //frame counter
volMult = 5000; //scaling factor

function setup() {
    cnv=createCanvas(window.innerWidth, window.innerHeight); //setup resizable square window
    centreCanvas();
    colorMode(HSB);
    angleMode(DEGREES);
    setupOsc(localIP,localPort,remoteIP,remotePort); //set address/port  of local machine, and address/port of TouchOSC
    mic = new p5.AudioIn();
    mic.start();
    mic.connect();
    fft = new p5.FFT(0.8,256);
    fft.setInput(mic);
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
}

function windowResized() {
    if (squareScreen==0){ //full screen window used in this example
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

//nextfunction fro p5js-osc package examples
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

//I sometimes use sockit.emit directly instead of endOsc
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

function draw() { //main draw function on browser window
    tick += 1; //frame counter
    background(0);

    vol=amplitude.getLevel(); //get current input level
    vol2=vol*volMult; //scale it
    translate(width / 2, height / 2); //centre coordinate system
    rectMode(CENTER); 
    fill('blue');
    //draw pattern of blue rectangles, position and size set by data received from Sonic Pi
    for(var i=0;i<7;i++){
        for(var j=0;j < 7;j++){
            rect( -(3-i)*lmax/2,-(3-j)*lmax/2,lh/2,lh/2 );
        }
    }
    fill('red');
    rect(0, 0, lh*2,lh*2); //draw red rectangle enclosing circle. size received from Sonic Pi   
    strokeWeight(4);
    stroke('red');
    if(enableLine == 1){ //draw line amrking current lmax level if enabled
        line(-300,-lmax,300,-lmax);
    }
    strokeWeight(1);
    //send current scaled vol2 to Sonic Pi, where lmax is computed and sent back.
    if(tick%2 == 0){
        sendOsc("/volValue",vol2); //update data sent to Sonic Pi every second frame to reduce traffic
    }
    fill('yellow');
    ellipse(0,0,2*vol2,2*vol2); //draw filled circle size set by amplitude of audio input
    stroke(1);
    textSize(28);
    fill('green');
    textAlign(CENTER);
    text("Sonic Pi Visualiser Demonstration by Robin Newman",0,height / 2 - 100);
    if (enableFlag == 1) { //control whether text is shown from Sonic Pi OSC input
        stroke('black');       
        textSize(24);
        fill('red');
        text(textMessage, 0, -height / 2 + 40) ; //Sonic Pi message
        fill('white');
        textAlign(LEFT);
        textSize(22);
        text('Scaled Amplitude: ' + round(vol2*100)/100, -160, -height / 2 + 80);
        text('Max. scaled Amplitude: ' + round(lmax*100)/100, -160, -height / 2 + 100);
    }

}
