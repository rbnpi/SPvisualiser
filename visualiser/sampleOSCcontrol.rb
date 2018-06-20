#specimen code to drive SPvisualiser
#by Robin Newman, June 2018
#adjust address for use_osc to local SP IP
#set with_bpm value appropriate to sync to music code
#which should be added after this code
#Music code should set :kill,1 when finished to stop these live loops.
use_osc "192.168.1.128",12000

osc "/1/feedback",0 #stops feedback to TouchOSC to reduce OSC traffic
osc "/1/transShape",1 #transparency of fft "shapes"
osc "/1/transStar",0.35 #rranparency of star fill
osc "/1/transStroke",1 #stroke for stars
osc "/1/starVol",0.6 #adjusts input vol scaling
osc "/1/jitterVol",1 #amplitude of audio  to display
osc "/1/starEnable",1 #enable main star

sleep 1 #adjust any desired delay before start. Leave minimum of 1
osc "/1/sync",1 #do one sync of TouchOSC if connected
use_random_seed 13579#123456789#987123#13579  #adjust for different results
set :kill,0 #flag to stop program at the end
set :override,0 #overrides some functions when display rotation takes place

with_bpm 120 do
  live_loop :oscControl do
    tick
    tick_set :t4,look/4
    plist=["/1/allOff","/1/p12","/1/p16","/1/p23","/1/p24","/1/p36","/1/p46","/1/horizPt","/1/t","/1/allOn"]
    osc plist.choose,1
    j=(ring 0,1).look(:t4)
    if get(:override)==0
      
      osc "/1/jitter",j #switches jitter on and off
      osc "/1/colInvert",rand_i; #//inverts colour for "shapes"
      ilist=['/1/inc0','/1/inc2','/1/inc4'] #list of colour increments
      osc ilist.choose,1 #choose a colour increment
      #alist is list of fieed display angles
      alist=['/1/angle45','/1/angleNeg45','/1/angle30','/1/angleNeg30','/1/resetAngle']
      if j==0 #only use if jitter is off
        osc alist.choose,1
      else
        osc "/1/resetAngle",1 #reset angle if jitter is on
      end
      
    end
    st=rand_i() #0 or 1
    osc "/1/smallStarEnable",st #switch small stars on and off
    if st == 0
      osc "/1/colStarsEnable",1 #disable colour stars when small are "on"
    else
      osc "/1/colStarsEnable",0
    end
    if rand_i()==1 #1 in 2 chance
      
      osc "/1/colStarsRotate",1 #rotate coloured stars
    else
      osc "/1/colStarsFixed",1 #fixerd position coloured stars
    end
    sleep 1
    stop if get(:kill)==1
  end
  
  #this live loop changes the amplitude of the fft plot shapes
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
  #this live loop siwtches between (centred) square and full window plot
  live_loop :switchAspect do
    osc "/1/squareWindow",rand_i();
    sleep [1,2,4,8].choose #remains in state for selected time
    stop if get(:kill) ==1
  end
  
  #this live loop controls continuous roation of the display
  #it inhibits audi jitter when active
  live_loop :controlRotate do
    sleep rrand_i(4,8) #delay before starts roation
    set :override,1
    #set rotation input is chosen +/- 0.25 -> 1
    a=(0.25+rand(0.75))*(-1)**dice(2)
    osc "/1/rotateSlider",a# send rotation data to sketch
    sleep rrand_i(4,8) #random time with this rotation state
    set :override,0 #allow jitter again
    stop if get(:kill) ==1
  end
end #end of with_bpm scope

#add following music code here. Example below
#note bpm of first section should be the same as for the "music" section
#or could be a multiple, eg 120 as in this case.
#produces a range of notes of different frequency and amplitude
#use of tb303 gives high harmonic content. Good for display
live_loop :example do
  use_synth :tb303
  play scale(:e2,:minor_pentatonic,num_octaves: 3).choose,amp: rrand(0.3,1),cutoff: rrand(40,100),release: 1
  sleep 1
  stop if get(:kill)==1
end
use_bpm 60
#add a percussion loop. Also good for display audio input
live_loop :drums do
  sample :loop_amen,beat_stretch: 2,amp: 2
  sleep 2
  stop if get(:kill)==1
end
at 60 do
  set :kill,1
end

