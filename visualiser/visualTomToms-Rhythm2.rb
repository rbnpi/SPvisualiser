

#demo program for Sonic Pi p5.js visualiser by Robin Newman, June 2018
#visualTomToms-Rhythm2.rb
use_osc "192.168.1.128",12000
osc "/1/feedback",0
osc "/1/transShape",1
osc "/1/transStar",0.35
osc "/1/transStroke",1
osc "/1/starVol",0.6
osc "/1/jitterVol",1
osc "/1/starEnable",1

sleep 1
osc "/1/sync",1
use_random_seed 123456789#987123#13579
set :kill,0
set :override,0

with_bpm 100 do
  live_loop :oscControl do
    tick
    tick_set :t4,look/4
    plist=["/1/allOff","/1/p12","/1/p16","/1/p23","/1/p24","/1/p36","/1/p46","/1/horizPt","/1/t","/1/allOn"]
    osc plist.choose,1
    j=(ring 0,1).look(:t4)
    if get(:override)==0
      
      osc "/1/jitter",j
      osc "/1/colInvert",rand_i;
      ilist=['/1/inc0','/1/inc2','/1/inc4']
      osc ilist.choose,1
      alist=['/1/angle45','/1/angleNeg45','/1/angle30','/1/angleNeg30','/1/resetAngle']
      if j==0
        osc alist.choose,1
      else
        osc "/1/resetAngle",1
      end
      
    end
    st=rand_i()
    osc "/1/smallStarEnable",st
    if st == 0
      osc "/1/colStarsEnable",1
    else
      osc "/1/colStarsEnable",0
    end
    if rand_i()==1
      
      osc "/1/colStarsRotate",1
    else
      osc "/1/colStarsFixed",1
    end
    sleep 1
    stop if get(:kill)==1
  end
  
  live_loop :shapesScale do
    50.times do |i|
      osc "/1/shapesScale",i*0.02
      sleep 0.02
    end
    50.times do |i|
      osc "/1/shapesScale",1-i*0.02
      sleep 0.02
    end
    stop if get(:kill)==1
  end
  
  live_loop :switchAspect do
    osc "/1/squareWindow",rand_i();
    sleep [1,2,4,8].choose
    stop if get(:kill) ==1
  end
  
  live_loop :controlRotate do
    sleep rrand_i(4,8)
    set :override,1
    a=(0.25+rand(0.75))*(-1)**dice(2)
    osc "/1/rotateSlider",a
    sleep rrand_i(4,8)
    set :override,0
    stop if get(:kill) ==1
  end
end

#Tomtom rhythms found on wikipedia https://en.wikipedia.org/wiki/Rhythm_in_Sub-Saharan_Africa#/media/File:Standard_pattern,_six_beats.png
#form the basis of this piece coded for Sonic PI by Robin Newman, December 2017
#version 2, more interesting bass. Best with a pair of decent speakers with good bass response!
l1=(ring 1,0,1,0,1,0,1,0,1,0,1,0)
l2=(ring 0,1,0,1,0,1,0,1,0,1,0,1)
l3=(ring 0,1,0,0,1,1,0,1,0,1,0,1)
l4=(ring 1,0,1,0,1,1,0,1,0,1,0,1)
l=(ring l1,l2,l3,l4)
#set :kill,0 #initialise kill flag
set :tr,0
use_bpm 50
with_fx :reverb,room: 0.7,mix: 0.6 do
  live_loop :drums1 do
    r=l.tick(:l)
    24.times do
      stop if get(:kill)==1 #check for when to stop this thread
      tick
      a=0.5;a=1 if look%3==0
      sample :drum_tom_hi_hard,amp: a,pan: [-1,1].choose  if r.look==1
      sleep 0.1
    end
  end
  
  live_loop :drums2 do
    stop if get(:kill)==1 #check for when to stop this thread
    a=0.5;a=1 if tick%4==0
    sample :drum_tom_lo_hard,amp: a,pan: [-0.5,0.5].choose
    sleep 0.3
  end
  
  
  live_loop :bass,delay: 1.2 do
    tick
    use_synth :tb303
    set :tr,7 if look==4
    set :tr,-5 if look==12
    set :tr,0 if look==8
    set :tr,0 if look==16
    
    q= play note(:e1)+get(:tr),attack: 1.2,release: 1.2+2.4,cutoff: 40,amp: 0.5
    control q,note: :e0,note_slide: 4.8 if look==20
    
    #play :e2,attack: 1.2,release: 1.2+2.4,cutoff: 60,amp: 0.25
    sleep 4.8
    if look==20 #adjust to give desired duration
      set :kill,1 #set stop flag
      stop #stop this thread
    end
  end
  
  live_loop :notes,delay: 1.2 do
    stop if get(:kill)==1 #check for when to stop this thread
    use_synth :blade
    n=scale(note(:e3)+get(:tr), :minor_pentatonic,num_octaves: 2).choose
    play n,release: 0.1,amp: [1,2].choose,pan: [-0.75,0,0.75].choose if spread(5,8).tick
    play n-12,release: 0.1,amp: [1,2].choose,pan: [-0.75,0,0.75].choose if !spread(5,8).look
    sleep 0.1
  end
end