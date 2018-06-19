
#SPvisualisertest.rb
#This program is used to demonstrate the use of a P5.js visualiser
#controlled by OSC messages, which can be sent both to and from Sonic Pi
set :lmax,0 #stores last max scaled level of audio input

#NB if using control from TouchOSC MUST put actual IP address here
use_osc "127.0.0.1",12000 #P5.js sketch runs on local host
osc "/enableLine",1
set :kill,0
sleep 1


with_fx :level,amp: 0 do |v| #loop controls audio level
  
  set :v,v
  live_loop :controlVol,sync: :p do
    use_real_time
    v=get(:v)
    control v,amp: rrand(0.3,1.2), amp_slide: 1
    sleep 1
    control v,amp: 0, amp_slide: 1
    sleep 1
    stop if get(:kill)==1
  end
  
  live_loop :p do #loop plays successive notes
    use_real_time
    nv=play scale(:c4,:major).choose,amp: 1,sustain: 2,release: 0
    sleep 2
    set :lmax,0 #reset stored max after each note
    stop if get(:kill)==1
  end
end

#loop receives level info, computes lmax and sends it back
#last received level sent back too, as it will be changing meantime
live_loop :feedback do
  use_real_time
  b = sync "/osc/volValue"
  level=b[0]
  lmax=get(:lmax)
  if level > lmax
    lmax=level
  end
  #last received level and latest lmax sent back to sketch
  osc "/returnData",level,lmax
  set :lmax,lmax #store new max value
  stop if get(:kill)==1
end

#function reduces amount to type in chat liveloop
define :textit do |msg|
  osc "/showText",msg
end

live_loop :chat do #loop sends text messages to sketch
  tick
  osc "/enableText",1
  textit "Hello there from Sonic Pi"
  sleep 4
  textit "Sonic Pi changes the text, and can switch it off"
  sleep 4
  osc "/enableText",0
  sleep 2
  osc "/enableText",1
  sleep 2
  textit "This example shows 2 way interaction between SP and the screen"
  sleep 4
  textit "Yellow Circle radius set by incoming audio amplitude"
  sleep 4
  textit "Red line shows current max audio, computed by Sonic Pi"
  sleep 4
  textit "Max value is reset each time input reduces to zero"
  sleep 4
  textit "SP max level is used to control size of rectangles"
  sleep 4
  textit "SP can switch display of the line on or off"
  8.times do #switch line off and on
    osc "/enableLine",0
    sleep 0.5
    osc "/enableLine",1
    sleep 0.5
  end
  if (look + 1) >= 2 #set number of interations required
    set :kill,1
    stop
  end
end
