

#demo program for Sonic Pi p5.js visualiser by Robin Newman, June 2018

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

with_bpm 110 do
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

with_fx :level,amp: 0 do |v|
  at 0 do #fade in volume
    control v,amp: 2,amp_slide: 5
  end
  at 110 do #initiate closedown
    control v,amp: 0,amp_slide: 10
    sleep 10
    set :kill,1
  end
  with_fx :gverb,room: 25, mix: 0.6 do
    live_loop :soundDebris do
      stop if get(:kill)==1
      with_fx :bpf,centre: rrand(60,150) do
        sample :loop_mehackit1,onset: rrand_i(0,9),rate: rrand(-2,2),pan: [-1,0,1].choose if spread(5,8).tick
        sample :loop_mehackit2,onset: rrand_i(0,13),rate: rrand(-2,2),pan: [-1,0,1].choose if !spread(5,8).look
        sleep rrand(0.1,0.25)
      end
    end
  end
end