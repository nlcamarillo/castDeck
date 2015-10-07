castDeck
========

Generic `iframe` based slide show chromecast application. Features:

- Multiple urls to create a slide show
- Scale factor adjustment
- Overscan adjustment
- Rotation adjustment
- Transition settings

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

See `senderApplication.js` for an example.

TODO: create an embeddable js library out of this

- The castDeck api id is `4EC978AD`
- When started, the following json message can be sent to the `urn:x-cast:org.firstlegoleague.castDeck` namespace

        {
            "url":"<url to load>",
            "rotation": <rotation in degrees>,
            "zoom": <zoom level>,
            "aspect": <"native"|ratio>,
            "overscan": [<top>,<right>,<bottom>,<left>]
        }