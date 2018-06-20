TouchOSC template for use with SPvisualiser

You can see the layout of the template in the image file TouchOSCImage.jpeg

It has some 50 or so controls and so at first sight may seem a bit daunting.

Dealing with the sliders first.

The yellow slider labelled "Rotate Speed" controls the rate at which the entire image will rotate. It is centred by default, and if you move it up the screen image rotates clockwise, and if you move it down, anticlockwise.
The five yellow buttons to its left, allow you to go to preset angle positions, the "Reset Angle" button setting it back to zero.
The "jitter rotate" button adds a random jitter to the rotation set by the "Rotate Speed" slider.

The Red slider labelled "Trans Shapes" sets the transparency of the fft "shapes" drawn on the screen. These become invisible if the slider is moved to the bottom, and fully opaque when it is at the top.
The red buttons on either side control changes in the colouring of these shapes. Normally their colour varies with their position in the fft spectrum plot. This can be rotated using the different "inc" settings. The "freeze" button prevents further changes, and the "inc +/-" button adjusts the direction of the changes.
The red "Colour Invert" button inverts the colours displayed in the shapes.

The blue "Shapes Scale" slider sets the maximum size of the fft shapes. This is used to effect by the Sonic Pi control programs which cycle this up and down.

The blue "Jitter Vol" slider controls the amplitude of audio jitter applied to the image. It is enabled using the blue "jitter on" button below.

The green "Trans. Star" and "Stroke Star" sliders alter the transparency of the fill and stroke of the large central star and its associated 4 smaller similar stars.

These two sets of stars are enabled by pink buttons below named "Star Enable" and "Small Star Enable". There is a third "Col Stars Enable" button which controls four colour filled stars. Three red buttons above this control whether these coloured stars rotate or are fixed, and if they rotate whether they roate clockwise or anticlockwise: the "colStars +/-" button.

The yellow button below that switches on and off the Sonic Pi logo, centrally on the screen. The size of the logo depends on the audio signal being received. If no signal is received it reverts to a large size.

The final green slider on the right marked "Star Vol." controls the amplitude gain of the signal controlling the star sizes. It has two scales High and Low controlled by the two green buttons labelled "High Range" and "Low Range"

Bottom right on the layout are a series of purple buttons. "pt1".."pt6" which control the display of the 6 possible sets of fft shapes.
The buttons "AllOff", "p12","p16"...."All On" select different combinations of these six shapes.

Finally there are four buttons on the bottom left of the layout.

"Audio Mute" toggles muting the audio feed to the display sketch. It does NOT mute what you hear from Sonic Pi.

"Square Window" alters the aspect ration of the plotted screen. You get better symmetry with the Square Window enabled, but when disabled the whole browser window size is utilised.

TIP: I installed the "BackGroundSkin" extension to Chrome Browser which enables you to set the default background to black. This stops you getting white sections beside the plot when Square Window is selected.

"Sync Display" updates the stae of the TouchSOSC display to reflect the settings current in the sketch.

"Auto Sync" repeatedly syncs the display every 10 frames, but at the expense of a lot of OSC traffic. Without it the slider positions are not updated if they are altered by OSC messages from Sonic Pi to the sketch.

The sketch works happpily with or without TouchOSC being present. IF it is present, it can act as well as input from Sonic Pi, although the latest changes made will apply.
