// visualiser with OSC controls
// designed for use with Sonic Pi 3 and TouchOSC
// written by Robin Newman, June 2018
//require launch node bridge.js before
// each and every run
// uses Gene Kogan's p5js-osc package
// linked via index.html file
// run from Brackets, or using npm http-server (local host)
// set up IP addresses/ports below

var localIP = '192.168.1.128';  //must use this NOT 127.0.0.1 to allow remote access of TouchOSC to work
var localPort = 12000;
var remoteIP = '192.168.1.240'; //TouchOSC address
var remotePort = 9000;

var mic; //references default audio input
var mute = 0; //flag to show if audio in is muted
var amplitude; //of mic input
var fft; //references fft transform
var vol; //holds audio level of input
var w; //bar width for hrozontal plot fft spectrum
var h; //bar "width" for vertical plot fft spectrum
var rot = 0; //current rotation angle
var xo = 0; //rotation increment for each draw
var volMult = 5000; //default multiplier for star size (lowRange)
var starVol = 0.5; //starVol sets star size (with multiplier)
var trans = 0.8; //fft plot fill transparency setting
var transStar = 0.5; //star fill transparency setting
var starEnable = 1; //enable main star
var smallStarEnable = 1; //enable 4 small stars
var transStroke = 1; //star stroke transparency setting
var jitter = 0; //audio jitter on/off applied to plot
var jitterVol = 0; //extent of audio jitter input
var rotRand = 0; //flag to add random rotation direction
var colInvert = 0; //flag to invert plot colours
var pt = [1,1,0,0,0,0]; //flags to enable different spectrum plots: 6 plots available
var socket; //for connection to web server
var isConnected; //flag set when output OSC set up
var cnv; //reference for canvas to allow re-centering
var squareScreen = 1; //set to 1 for square aspect, 0 for full window
var colInc  = 0; //change in colour inc per frame
var inc = 0; //current inc in colour per frame
var incDir = 1;//whether change in inc for colour changes is +ve or -ve
var freezeInc = 0;//freeze colour increment for display
var starInc = 0; //used to control star roation of coloured stars
var img; //for preloaded Logo images
var colStarsEnable = 1; //enable coloured stars
var colStarsRotate = 0; //rotation state of colours stars
var colStarsPlusMinus = 1; //rotation direction for coloured stars
var showLogo = 1; //floag to cotnrol showing of logo images
var shapesScale = 1; // varies in range 0->1 scales spectrum plot size
var ext; //extra scaling multiplier for coloured stars
var tick = 0; //frame counter
var feedback = 1;//enable feedback to TouchOSC
function preload(){
    img = loadImage('/SPvisualiser/visualiser/sonic-pi-web-logoTR.png'); //transparent Sonic Pi logo
}
function setup() {
    cnv=createCanvas(window.innerHeight, window.innerHeight); //setup resizable square window
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
    w = round(width / 512); //width of plot rectangles
    h = round(height / 512); //"width" of plot rectangles when transformed to vertical
}

function windowResized() {
    if (squareScreen==0){
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

//I used sockit.emit directly instead of endOsc
function sendOsc(address, value) {
    if (isConnected){
        socket.emit('message', [address, value]);
    }
}


function draw(){
    background(0);
    tick +=1;
    var spectrum = fft.analyze();
    //vol = mic.getLevel();
    vol=amplitude.getLevel();
    //fill(255);  //uncomment next three lines to display input amplitude
    //stroke(1);
    //text('Amplitude: ' + vol, 20, 20);
    noStroke();

    if (colStarsRotate==1){ //control rotation of coloured stars
        starInc=(starInc-xo+4*colStarsPlusMinus)%360;
    }else{
        starInc=0;
    }

    if (freezeInc == 0){ //control incerment of colours
        inc = (inc+incDir*colInc)%256 //work out colour inc for this frame
    }else{inc=inc;}

    var rval = map(vol*2*jitterVol,0,1,0,360); //rotate variable
    translate(width / 2, height / 2); //centre coordinate system

    if (showLogo == 1){//draw Logo if enabled
        imageMode(CENTER); //centre drawing of Sonic Pi image
        //size controlled by volume. NB drawn BEFORE rotation set up so stays constant
        image(img,0,15,img.width*vol*starVol*25,(img.height)*vol*starVol*25);
    }

    //setup rotation with or without jitter
    if (jitter == 1){
        rotate(rval*random([-1,1])+rot);}else{
            rotate(rot);
        }

    //setup rotation if enabled, with or without random addition
    //xo is set by osc input, initially 0
    if (rotRand==1){
        rot +=xo*random([1,1,1,-1,-1,1,1]);} else{
            rot += xo;
        }

    //work through fft spectrum values    
    for (var i = 0; i < spectrum.length; i++) {
        //get scaled values for x and y amplitudes
        var amp = spectrum[i];
        var y = map(amp, 0, 256, 0, shapesScale*height / 2);
        var x = map(amp, 0, 256, 0, shapesScale*width / 2);

        //set the colour fill according to colInvert value for each separate value
        if (colInvert == 0) {
            fill(abs((i + inc)%256),255,255,trans); //trans adjusts alpha value. In put from OSC message 
        } else{
            fill(abs((256-i + inc)%256) ,255,255,trans);
        }

        //There follow 6 different plots, each with some symmetry, of the data
        //these are selected by setting the appropraiate pt valriable to 1, using OSC message inputs
        if (pt[0] == 1){
            rect(i * w - width / 2, 0, w - 1 ,  -y );
            rect(i * w - width / 2, 0, w - 1,  y);
            rect(width / 2 - i*w, 0, w - 1,   - y);
            rect(width / 2 - i*w, 0, w - 1,   y);
        }

        if (pt[1] ==1){
            rect(0, i * h - height / 2, x, h - 1);
            rect(0, i * h - height / 2, -x, h - 1);
            rect(0, height / 2 - i * h, -x, h - 1);
            rect(0, height / 2 - i * h, x, h - 1);
        }

        if (pt[2] ==1){
            rect(-i*w, 0, w - 1 ,  -y );
            rect(i * w, 0, w - 1 ,  -y );
            rect(i * w, 0, w - 1,  y);
            rect(-i * w, 0, w - 1,  y);
        }

        if (pt[3] == 1){
            rect(width / 2 - i*w, 0, w - 1,   - y);
            rect(width / 2 - i*w, 0, w - 1,   y);
            rect(  i*w - width / 2, 0, w - 1,   - y);
            rect(  i*w - width / 2, 0, w - 1,   y);
        }

        if (pt[4]==1){
            rect(0, i * h , x, h - 1);
            rect(0, i * h , -x, h - 1);
            rect(0,  - i * h, -x, h - 1);
            rect(0,  - i * h, x, h - 1);
        }

        if(pt[5]==1){
            rect(0, i * h - height / 2, x, h - 1);
            rect(0, i * h - height / 2, -x, h - 1);
            rect(0, height / 2 - i * h, -x, h - 1);
            rect(0, height / 2 - i * h, x, h - 1);
        }
    }

    //set up star colours and stroke
    fill(random(255), 100,100, transStar) ; //transparency of fill adjustable by OSC message
    stroke(random(255),100,100,transStroke); //transparency of stroke adjustable by OSC message
    strokeWeight(4);

    //4 half size stars if enabled
    if((smallStarEnable == 1) && (vol > 0.005)){  //check min volume so no dots left
        star(width / 4,0,vol * starVol * volMult / 2,vol *starVol * volMult * 0.25,3 + round(vol*360));
        star(-width / 4,0,vol * starVol * volMult / 2,vol *starVol * volMult * 0.25,3 + round(vol*360));
        star(0,height / 4,vol * starVol * volMult / 2,vol *starVol * volMult * 0.25,3 + round(vol*360));
        star(0,-height / 4,vol * starVol * volMult / 2,vol *starVol * volMult * 0.25,3 + round(vol*360));
    }

    //a single star in the centre of the screen if enabled, controlled by OSC messsage
    //drawn after half size stars to be in front of them
    if ((starEnable == 1) && (vol > 0.005)){ 
        //draw the star. Size and number of vertices depends on current vol and mult settings.
        star(0,0,vol * starVol * volMult,vol *starVol * volMult * 0.5,3 + round(vol*360));
    }

    if (colStarsEnable == 1){
        push;
        noStroke();
        for (var ci = 0; ci < 4; ci++) {
            fill(90*ci,100,100);
            ext = starVol * volMult / 100; //extra scale value for coloured stars
            star(width/4*cos(ci*90+45+starInc)*vol * ext , height/4*sin(ci*90+45+starInc)*vol *ext , vol * starVol * volMult / 2,vol * starVol * volMult / 4,3 + round(vol*360));

        }
        pop;
    }

    if ((tick%10 == 0)&&(feedback==1)){  //update TouchOSC every 10 frames
        console.log("Sync update");
        oscSyncMessages();
    }
}

//standard function to produce a star from p5js website. Added angle mode changes as main section is in DEGREES
function star(x, y, radius1, radius2, npoints) {
    var angle = TWO_PI / npoints;
    var halfAngle = angle/2.0;
    beginShape();
    angleMode(RADIANS); //this routine wants RADIANS
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius2;
        var sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a+halfAngle) * radius1;
        sy = y + sin(a+halfAngle) * radius1;
        vertex(sx, sy);
    }
    angleMode(DEGREES); //set back to DEGREES used in rest of draw process
    endShape(CLOSE);
}

//This function receives and parses all the OSC messages, setting variables as a results
function receiveOsc(address, value) {
    console.log("received OSC: " + address + ", " + value);
    if (address == '/1/sync') {
        if (value[0] == 1){
            console.log("Initialising...");
            oscSyncMessages();
            setPtValues();
            setColStarsLeds(colStarsRotate);
            audioOn(mute);
            if (volMult==5000){
                setLed(0);
            }else{
                setLed(1);
            }
            setIncLed('00000');
        }
    }
    if (address == '/1/showLogo') { //sets flag to display Logo
        showLogo = value[0];
    }
    if (address == '/1/rotateSlider') { //sets xo which controls rotate increment
        xo = value[0] * 2;      
    }
    if (address == '/1/shapesScale') { //sets shapesVol
        shapesScale = value[0];
    }
    if (address == '/1/transShape') { //adjusts transparency of shapes
        trans = value[0];
    }
    if (address == '/1/transStar') { //adjust transparency of star fill
        transStar = value[0];
    }
    if (address == '/1/transStroke') { //adjust transparency of star stroke
        transStroke = value[0];
    }
    if (address == '/1/starVol') { //adjust size of star using gain multiplier
        starVol =value[0];
        //mult = value[0] * volMult;
    }
    if (address == '/1/volMultLow') { //adjust size of star using gain multiplier
        if (value[0]==1){
            volMult = 5000;
            setLed(0);
        }        
    }
    if (address == '/1/volMultHigh') { //adjust size of star using gain multiplier
        if (value[0]==1){
            volMult = 15000;
            console.log("volMultHigh " + volMult);
            setLed(1);
        } 
    }
    if (address == '/1/resetAngle') { //resets rot and xo values to 0
        if(value[0]==1){
            rot = 0;
            xo = 0;
            if(isConnected){
                socket.emit('message', ['/1/rotateSlider', 0]);
            }
        }
    }
    if (address == '/1/angle30') { //resets rot to 30
        if(value[0]==1){
            rot = 30;
            xo = 0;
            if(isConnected){
                socket.emit('message', ['/1/rotateSlider', 0]);
            }
        }
    }
    if (address == '/1/angleNeg30') { //resets rot to -30
        if(value[0]==1){
            rot = -30;
            xo = 0;
            if(isConnected){
                socket.emit('message', ['/1/rotateSlider', 0]);
            }
        }
    }
    if (address == '/1/angle45') { //resets rot to 45
        if(value[0]==1){
            rot = 45;
            xo = 0;
            if(isConnected){
                socket.emit('message', ['/1/rotateSlider', 0]);
            }
        }
    }
    if (address == '/1/angleNeg45') { //resets rot to -45
        if(value[0]==1){
            rot = -45;
            xo = 0;
            if(isConnected){
                socket.emit('message', ['/1/rotateSlider', 0]);
            }
        }
    }
    if(address == '/1/inc0') {
        if(value[0]==1){
            inc = 0;
            colInc=0;
            setIncLed('10000');
        }
    }
    if(address == '/1/inc05') {
        if(value[0]==1){
            colInc=0.5;
            setIncLed('01000');
        }
    }
    if(address == '/1/inc1') {
        if(value[0]==1){
            colInc=1;
            setIncLed('00100');
        }
    }
    if(address == '/1/inc2') {
        if(value[0]==1){
            colInc=4;
            setIncLed('00010');
        }
    }
    if(address == '/1/inc4') {
        if(value[0]==1){
            colInc=4;
            setIncLed('00001');
        }
    }
    if(address == '/1/freezeInc') {
        freezeInc=value[0];
    }
    if(address == '/1/incDir') {
        incDir = value[0];
    }
    if (address == '/1/jitterVol') { //adjust amount of amplitude jitter
        jitterVol = value[0];
    }
    if (address == '/1/jitter') { //jitter on/off control
        jitter = value[0];
    }
    if (address == '/1/starEnable') { //control whether star is drawn
        starEnable = value[0];
    }
    if (address == '/1/colStarsEnable') { //control whether coloured stars are drawn
        colStarsEnable = value[0];
    }
    if (address == '/1/colStarsFixed') { //control whether coloured stars are rotating
        if (value[0] ==1){
            colStarsRotate = 0;
            setColStarsLeds(0);   
        }
    }
    if (address == '/1/colStarsRotate') { //control whether coloured stars are rotating
        if (value[0] ==1){
            colStarsRotate = 1;
            setColStarsLeds(1);   
        }
    }
    if (address == '/1/colStarsPlusMinus') { //control whether coloured stars are drawn
        colStarsPlusMinus = value[0];
    }
    if (address == '/1/smallStarEnable') { //control whether star is drawn
        smallStarEnable = value[0];
    }

    if (address == '/1/jitterRotate') { //adjust random rotation jitter
        rotRand = value[0];
    }
    if (address == '/1/colourInvert') { //control inversion of shape colours
        colInvert = value[0];
    }
    if (address == '/1/pt1') { //ucontrol selection of pt1
        pt[0] = value[0];
    }
    if (address == '/1/pt2') {
        pt[1] = value[0];
    }
    if (address == '/1/pt3') {
        pt[2] = value[0];
    }
    if (address == '/1/pt4') {
        pt[3] = value[0];
    }
    if (address == '/1/pt5') {
        pt[4] = value[0];
    }
    if (address == '/1/pt6') {
        pt[5] = value[0];
    }
    if (address == '/1/allOff') { //switches off all pt section drawing
        if (value[0]==1){
            pt=[0,0,0,0,0,0];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/allOn') { //switches on all pt section drawing
        if (value[0]==1){
            pt=[1,1,1,1,1,1];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/horizPt') { //switches hrizontal pt sectiona on for drawing
        if (value[0]==1){
            pt=[1,0,1,1,0,0];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/vertPt') { //switches hrizontal pt sectiona on for drawing
        if (value[0]==1){
            pt=[0,1,0,0,1,1]
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/p12') { //switches vertical pt sections on for drawing
        if (value[0]==1){
            pt=[1,1,0,0,0,0];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/p16') { //switches vertical pt sections on for drawing
        if (value[0]==1){
            pt=[0,0,1,0,1,0,1];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/p23') { //switches vertical pt sections on for drawing
        if (value[0]==1){
            pt=[0,1,1,0,0,0];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/p24') { //switches vertical pt sections on for drawing
        if (value[0]==1){
            pt=[0,1,0,1,0,0];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/p36') { //switches vertical pt sections on for drawing
        if (value[0]==1){
            pt=[0,0,1,0,0,1];
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/p46') { //switches vertical pt sections on for drawing
        if (value[0]==1){
            pt=[0,0,0,1,0,1]
            setPtValues(); //updates external pt values with OSC
        }
    }
    if (address == '/1/squareWindow'){ //adjusts window aspect when OSC received
        squareScreen = value[0];
        if (squareScreen == 0){
            resizeCanvas(windowWidth, windowHeight); //change to normal screeen aspect
        }else{
            resizeCanvas(windowHeight, windowHeight); //change to square screen aspect    
        }
        centreCanvas(); //centre the sketch drawing on canvas
        //console.log("squareScreen is "+squareScreen);
    } 
    if (address == '/1/audioMute') { //audio on/off control
        audioOn(value[0]);
    }
    if (address == '/1/feedback') { //switch sync output to TouchOSC on/off
        feedback = value[0];
        if (isConnected ){
            socket.emit('message', ['/1/feedback',value[0]]); //update TouchOSC
        }
    }
}

function setPtValues() { //sends OSC messages with current pt values
    if (isConnected) {
        socket.emit('message', ['/1/pt1', pt[0]]);
        socket.emit('message', ['/1/pt2', pt[1]]);
        socket.emit('message', ['/1/pt3', pt[2]]);
        socket.emit('message', ['/1/pt4', pt[3]]);
        socket.emit('message', ['/1/pt5', pt[4]]);
        socket.emit('message', ['/1/pt6', pt[5]]);
    }    
}

function oscSyncMessages (){ //initialises settings via OSC with current values
    if (isConnected) {
        //console.log("function oscSyncMessages called")
        socket.emit('message', ['/1/rotateSlider', xo / 2]);
        socket.emit('message', ['/1/transShape', trans]);
        socket.emit('message', ['/1/shapesScale', shapesScale]);
        socket.emit('message', ['/1/freezeInc', freezeInc]);
        socket.emit('message', ['/1/incDir', incDir]);
        socket.emit('message', ['/1/transStar', transStar]);
        socket.emit('message', ['/1/starEnable', starEnable]);        
        socket.emit('message', ['/1/colStarsEnable', colStarsEnable]);       
        socket.emit('message', ['/1/colStarsPlusMinus', colStarsPlusMinus]);       
        socket.emit('message', ['/1/smallStarEnable', smallStarEnable]); 
        socket.emit('message', ['/1/starVol', starVol]);
        socket.emit('message', ['/1/transStroke', transStroke]);
        socket.emit('message', ['/1/jitter', jitter]);
        socket.emit('message', ['/1/jitterVol', jitterVol]);
        socket.emit('message', ['/1/jitterRotate', rotRand]);
        socket.emit('message', ['/1/colourInvert', colInvert]);
        socket.emit('message', ['/1/showLogo', showLogo]);
        socket.emit('message', ['/1/squareWindow', squareScreen]);
        socket.emit('message', ['/1/audioMute', mute]);
        //console.log("function oscSyncMessages completed");
    }
}

function setLed(led){ //controls range leds
    if (isConnected){
        if(led==0){
            socket.emit('message', ['/1/highLed', 0]);   
            socket.emit('message', ['/1/lowLed', 1]);
        }else{
            socket.emit('message', ['/1/highLed', 1]);   
            socket.emit('message', ['/1/lowLed', 0]); 
        }
    }
}

function setColStarsLeds(led){ //controls leds for colour stars rotation state
    if (isConnected){
        if(led==0){
            socket.emit('message', ['/1/colStarRotLed', 0]);   
            socket.emit('message', ['/1/colStarFixedLed', 1]);
        }else{
            socket.emit('message', ['/1/colStarRotLed', 1]);   
            socket.emit('message', ['/1/colStarFixedLed', 0]); 
        }
    }
}

function setIncLed(state){ //controls leds showing rate of change of colour spectrum
    if (isConnected) {
        console.log('state',state);
        socket.emit('message', ['/1/incLed0', state[0]]);
        socket.emit('message', ['/1/incLed05', state[1]]);
        socket.emit('message', ['/1/incLed1', state[2]]);
        socket.emit('message', ['/1/incLed2', state[3]]);
        socket.emit('message', ['/1/incLed4', state[4]]);                                 
    } 
}

function audioOn(state) { //sets audio input mute state
    if (state == 0){
        mic.start();
        mute=0;
        if (isConnected ){
            socket.emit('message', ['/1/audioMute',0]);
        }  
    }else{
        mic.stop();
        mute=1;
        if (isConnected ){
            socket.emit('message', ['/1/audioMute',1]);
        }  
    }
}
