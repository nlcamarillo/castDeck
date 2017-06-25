var flashTimer;

function flash(msg) {
    window.clearTimeout(flashTimer);
    var f = document.getElementById('flash');
    f.firstChild.innerHTML = msg;
    f.style.opacity = 1;
    flashTimer = window.setTimeout(function() {
        f.style.opacity = 0;
    },2000);
}

var Shim = (function() {
    function Shim(url,config) {
        this.config = config||{};
        this.initialize();
    }
    Shim.prototype.initialize = function() {
        this.frames = [];
        this.data = {
            scale: 1,
            aspect: 'native',
            rotation: 0,
            overscan: [0,0,0,0],
            displayId: window.location.href.split('/').pop()
        };
        this.displayId = window.location.href.split('/').pop();
        this.addFrame();
        var self = this;
        window.onresize = function() {
            self.reflow();
        };
        this.reflow();
    };
    Shim.prototype.update = function(data) {
        if (data.url && data.url !== this.data.url) {
            this.setFrameUrl(this.frames[0], data.url);
        }
        this.data = data;
        this.reflow();
    };
    Shim.prototype.addFrame = function() {
        let frame = document.createElement('iframe');
        document.body.appendChild(frame);
        this.frames.push(frame);
    }
    Shim.prototype.setFrameUrl = function(frame, url) {
        frame.src = 'about:blank';
        frame.onload = function(){
          frame.src = url;
          frame.onload = null;
        }
    };
    Shim.prototype.getScale = function() {
        return this.data.zoom||1;
    };
    Shim.prototype.getViewport = function() {
        var w = document.body.clientWidth-this.data.overscan[1]-this.data.overscan[3];
        var h = document.body.clientHeight-this.data.overscan[0]-this.data.overscan[2];
        return {
            w: w,
            h: h,
            a: w/h
        };
    };
    Shim.prototype.getAspect = function() {
        if (typeof this.data.aspect==='number') {
            return this.data.aspect;
        } else {
            return this.getViewport().a;
        }
    };
    Shim.prototype.reflowBody = function() {
        var os = this.data.overscan;
        //pixel size of the display
        var cw = document.body.clientWidth-os[1]-os[3];
        var ch = document.body.clientHeight-os[0]-os[2];
        //body style to adjust for overscan
        document.body.style.left = ((os[3]-os[1])/2)+'px';
        document.body.style.top = ((os[0]-os[2])/2)+'px';
    }
    Shim.prototype.reflowFrame = function(frame) {
        var vp = this.getViewport();
        var scale = this.getScale();
        this.scaleX = vp.a*scale/this.getAspect();
        this.scaleY = scale;
        //pixel size of the viewport (scaled)
        var bw = vp.w/this.scaleX;
        var bh = vp.h/this.scaleY;
        //size of the rotated viewport
        var width = ((this.data.rotation%180)===90)?bh:bw;
        var height = ((this.data.rotation%180)===90)?bw:bh;

        var style = '';
        var rotate = 'rotate('+(this.data.rotation||0)+'deg)';
        var scaleX = 'scaleX('+this.scaleX+')';
        var scaleY = 'scaleY('+this.scaleY+')';
        var transform = scaleX+' '+scaleY+' '+rotate+';';
        style += '-webkit-transform: '+transform;
        style += '-moz-transform: '+transform;
        style += 'transform: '+transform;
        style += 'width:'+width+'px;';
        style += 'height:'+height+'px;';
        //center
        style += 'margin-left:'+(-width/2)+'px;';
        style += 'margin-top:'+(-height/2)+'px;';
        frame.setAttribute('style',style);
    }
    Shim.prototype.reflow = function() {
        this.frames.forEach(frame => this.reflowFrame(frame));
        this.reflowBody();
    };

    return Shim;
}());

var shim = new Shim();

function setupChromcast() {
    var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    var customMessageBus = castReceiverManager.getCastMessageBus(
        'urn:x-cast:org.firstlegoleague.castDeck',
        cast.receiver.CastMessageBus.MessageType.JSON
    );
    customMessageBus.onMessage = function(event) {
        var str = JSON.stringify(event.data);
        shim.update(event.data);
        // send something back
        customMessageBus.send(event.senderId,{
            requestId: event.data.requestId,
            data: 'ack'
        });
    };
    castReceiverManager.start();
}

setupChromcast();
