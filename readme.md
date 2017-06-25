castDeck
========

![](castDeck.jpg)

Generic `iframe` based slide show chromecast application. Features:

- Scale factor adjustment
- Aspect ratio adjustment
- Overscan adjustment
- Rotation adjustment
- Transitions between multiple urls

Usage
-----

- Go to the [control url](https://firstlegoleague.github.io/castDeck)
- Adjust settings
- Press `cast`

Using the receiver alone
-----

The management application is just one example. You could use the receiver application in your own product as well. In general, the way it works is as follows:

- create a web page, anywhere. This contains the content you want to display.
- create a sender application, that loads up castDeck on your chromecast, which the content web page.
- control castDeck from your own application. The api is discussed below.

Api
-----

To create your own application around castDeck:

- include the google cast api: `www.gstatic.com/cv/js/sender/v1/cast_sender.js`
- include the `senderApplication.js`

CastDeck is available as a global `castDeck` singleton

##options

set `castDeck.options.log = true;` after including `senderApplication.js` to enable logging for debugging

##methods

### castDeck.cast(url? || url[]?)

start casting with the given url. Url can be a single string or an array

### castDeck.stop()

stop casting

### castDeck.setZoom(value), castDeck.zoomIn(), castDeck.zoomOut(), castDeck.zoomReset()

adjust zoom

### castDeck.rotateCCW(), castDeck.rotateCW()

rotate counter clockwise (CCW) or clockwise (CW)

### castDeck.adjustTop(px), castDeck.adjustRight(px), castDeck.adjustBottom(px), castDeck.adjustLeft(px)

adjust overscan parameters. Some monitors (tvs specifically) cut away some of the sides of the viewport. You can adjust the overscan parameters to mitigate that.

### castDeck.updateAspect(value | 'native')

pass in the string `native` or a numeric value to adjust the aspect ratio. Some monitors distort the HD aspect ratio (which is 16:9) to fit the ratio of the device. Pass in the actual aspect ratio of the device to fix this distortion.

### castDeck.updateTransition(value)

set the transition type, currently only 'fade' is supported

### castDeck.updateDuration(value)

set the display duration between transition, defaults to 10 seconds.

Notes
---

- The castDeck api id is `4EC978AD`
- When started, the following json message can be sent to the `urn:x-cast:org.firstlegoleague.castDeck` namespace

        {
            "url":"<url to load>",
            "rotation": <rotation in degrees>,
            "zoom": <zoom level>,
            "aspect": <"native"|ratio>,
            "overscan": [<top>,<right>,<bottom>,<left>],
            "transition": "fade",
            "duration": <seconds>
        }
