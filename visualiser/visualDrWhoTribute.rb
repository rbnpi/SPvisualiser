#visualDrWhoTribute.rb
#demo program for Sonic Pi p5.js visualiser by Robin Newman, June 2018

use_osc "192.168.1.128",12000
osc "/1/feedback",0
osc "/1/transShape",1
osc "/1/transStar",0.35
osc "/1/starVol",0.6
osc "/1/jitterVol",1
osc "/1/starEnable",1
use_random_seed 123456789#987123#13579
set :kill,0

with_bpm 100 do
  live_loop :oscControl do
    tick
    tick_set :t4,look/4
    plist=["/1/allOff","/1/p12","/1/p16","/1/p23","/1/p24","/1/p36","/1/p46","/1/horizPt","/1/t","/1/allOn"]
    osc plist.choose,1
    j=(ring 0,1).look(:t4)
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
end

#Tribute to Dr Who coded by Robin Newman, February 2015
#Better on a Pi2 or Mac. A bit scratchy on B+ but just about OK

use_synth :prophet #synth for bass part

s=0 #to set the scope of the variable redefined in the next function
define :usebpm do |n| #setup own bpm definition
  s=1.0/8*120/n
end
usebpm(200) #set required bpm
sq=1*s #define note durations from sq semiquever, to md dotted minum
q=2*s
c=4*s
cd=6*s
m=8*s
md=12*s

define :pl do |notes,dur| #play linked arrays of notes and durations
  notes.zip(dur).each do |n,d|
    play n,sustain: d*0.9,release: d*0.1
    sleep d
  end
end

define :p do |n,v| #play single sustained note
  play n,sustain: v*0.9,release: v*0.1,amp: 0.4
  sleep v
end

define :p3 do |n| #second rhythmic patter
  p(n,c)
  p(n,q)
  p(n,c)
  sleep q
end
define :p4 do |n| #third rhythmic pattern
  3.times do
    p(n,q)
  end
  p(n,c)
  sleep q
end
define :fall do |n| #falling note pattern
  p(n,q)
  sleep q
  p(n,c)
  p(note(n)-2,q)
  p(note(n)-5,q)
end
define :rise do |n| #rising note pattern
  p(n,q)
  sleep q
  p(n,c)
  p(note(n)+1,q)
  p(note(n)+3,q)
end
define :last do #last bar chord
  play [:e2,:b2],sustain: 8*c*0.9,release: 8*c*0.1,amp: 0.4
  sleep 8*c
end
#set up melody part
tr=[:r,:b4,:c6,:b5,:d5,:a4,:b4,:b5,:g5,:b4,:b4,:d5,:c5,:b4,:b4,:a3,:b3,:c4,:d4,:b3,:c5,:b4,:r,:a5,:c6]
td=[6*7.5*c,cd,cd,c*9,cd,cd,c*12,cd,cd,cd+c,q,cd+c,q,md,cd,cd,cd+q,q,q,cd+c,q,c*15,md,cd,cd]
tr.concat [:b5,:g5,:b5,:a5,:g5,:fs5,:g5,:g4,:d5,:e5,:d5,:c5,:d5,:g4,:d5,:e5,:d5,:c5,:d5,:g5,:b5,:a5,:g5,:fs5,:g5]
td.concat [9*c,cd,cd,cd+q,q,q,c*6,cd,cd,cd+q,q,q,cd,c,q,cd+q,q,q,cd,c,q,c*5,q,q,c*12]
tr.concat [:r]
td.concat [c*12]
tr.concat [:b5,:g5,:b4,:b4,:d5,:c5,:b4,:b4,:c4,:b3,:c4,:d4,:b3,:c5,:b4,:a5,:c6,:b5,:g5,:b5]
td.concat [cd,cd,cd+c,q,cd+c,q,md,cd,cd,cd+q,q,q,cd+c,q,c*18,cd,cd,c*9,cd,cd]
tr.concat [:a5,:g5,:fs5,:g5,:g4,:d5,:e5,:d5,:c5,:d5,:g4,:d5,:e5,:d5,:c4,:d5,:g5,:b5,:a5,:g5,:fs5,:e5]
td.concat [cd+q,q,q,c*6,cd,cd,cd+q,q,q,cd,c,q,cd+q,q,q,cd,c,q,c*5,q,q,c*12]
tr.concat [:r,:b3,:c5,:b4,:b5,:c6]
td.concat [c*9,cd,cd,md,cd+c,q] #last bar separate
#puts tr.length
#puts td.length
#tr=tr[1..-1] #for testing remove first long rest
#td=td[1..-1] #for testing remove first long rest

#start playing:###################################################
#initial background noise
sample :elec_filt_snare,rate: 0.5
sample :ambi_lunar_land,rate: -1.5

#background noise part in thread
with_fx :level,amp: 3 do
  in_thread do
    30.times do
      sample :ambi_lunar_land,rate: [1,-1].choose
      sleep 1.5*6*c
    end
  end
end

#bass rhythm part in thread
in_thread do
  tune=[p3(:e3),p3(:e3),p3(:e3),p3(:g3),p3(:e3),p3(:e3),p3(:e3),p4(:g3),p4(:e3),p4(:e3),p4(:e3),fall(:g3)]
  #bar 7
  tune.concat [p4(:e3),p4(:e3),p4(:e3),fall(:g3),p4(:e3),p4(:e3),p4(:b2),rise(:b2),p4(:e3),p4(:e3)]
  #bar 12
  tune.concat [p4(:b2),rise(:b2),p3(:e3),p3(:e3),p3(:g3),rise(:b2),p3(:g2),p3(:g2)]
  #bar 16
  tune.concat [p3(:b2),p3(:b2),p3(:b2),fall(:d3),p3(:b2),p3(:b2),p3(:b2),fall(:d3),p3(:g2),p3(:g2)]
  #bar 21
  tune.concat [p4(:g2),p4(:g2),p4(:d3),p4(:g2),p4(:g2),p4(:g2),p4(:c3),p4(:g2),p4(:c3),p4(:g2),p4(:b2),p4(:b2)]
  #bar 27
  tune.concat [p4(:e3),p4(:e3),p4(:b2),rise(:b2),p4(:e3),p4(:e3),p4(:b2),rise(:b2),p3(:e3),p3(:e3)]
  #bar 32
  tune.concat [p3(:g3),rise(:b2),p3(:g3),p3(:g3),p4(:b2),p3(:b2),fall(:d3),p3(:b2),p4(:b2),p3(:b2),fall(:d3),p3(:b2)]
  #bar 38
  tune.concat [p3(:g2),p3(:g2),p4(:g2),p4(:g2),p4(:d3),p4(:g2),p4(:g2),p4(:g2),p4(:c3),p4(:g2),p4(:c3),p4(:g2),p4(:b2),p4(:b2)]
  #bar 45
  tune.concat [p4(:e3),p4(:e3),rise(:e3),fall(:g3),p4(:e3),p4(:e3),p4(:e3),fall(:g3)]
  #bar 49
  tune.concat [last]
end

#melody part
with_fx :reverb,room: 0.8 do
  with_synth :zawa do
    pl(tr,td) #play the linked arrays of notes and their durations
    #now do last bar with note slide and swoosh
    p=play :b5,release: c*9
    sleep cd #pause before the slide
    control p,note: :e2,note_slide: c*9-cd #slide
    sample :ambi_swoosh,rate: 1.2
    sleep 0.8
    sample :ambi_swoosh,rate: 1.2
    sleep 0.8
    sample :ambi_swoosh,rate: 0.75
    set :kill,1
  end
end


