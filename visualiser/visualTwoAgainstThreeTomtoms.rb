
#visualTwoAgainstThreeTomtoms.rb by Robin Newman, June 2018
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
use_random_seed 8079685746#123456789#987123#13579
set :kill,0
set :override,0

with_bpm 60 do
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
    a=(0.25+rand(0.75))*(-1)**(ring 1,2,1,1,2,2).tick
    osc "/1/rotateSlider",a
    sleep rrand_i(4,8)
    set :override,0
    stop if get(:kill) ==1
  end
end

at rt(120) do #run for 120 seconds
  set :kill,1
end


use_bpm 60
define :pl do |s,d,p=0|
  sample s,pan: p
  sleep d
end

lb1=lb2=0



live_loop :stutter do
  set :bpm1,(ring 90,150,90,180,210).tick(:t) if tick%2==0
  use_bpm get(:bpm1)
  puts "1 is #{get(:bpm1)}"  if get(:bpmq) !=lb1
  pl :drum_tom_mid_hard, 1,0
  density 3 do
    pl :drum_tom_hi_soft, 1,0
  end
  pl :drum_tom_lo_soft, 1,0
  lb1=get(:bpm1)
  stop if get(:kill)==1
end
live_loop :stutter2 do
  set :bpm2,(ring 90,150,90,180,210).tick(:t) if tick%3==0
  use_bpm get(:bpm2)
  puts "2 is #{get(:bpm2)}" if get(:bpm2) !=lb2
  density 2 do
    pl :drum_tom_hi_soft, 1,1
  end
  pl :drum_tom_lo_hard, 1,1
  lb2=get(:bpm2)
  stop if get(:kill)==1
end
