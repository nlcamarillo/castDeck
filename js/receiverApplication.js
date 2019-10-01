var flashTimer;

function flash(msg) {
    window.clearTimeout(flashTimer);
    var f = document.getElementById("flash");
    f.firstChild.innerHTML = msg;
    f.style.opacity = 1;
    flashTimer = window.setTimeout(function() {
        f.style.opacity = 0;
    }, 2000);
}

var Shim = (function() {
    function Shim(url, config) {
        this.config = config || {};
        this.initialize();
    }
    Shim.prototype.initialize = function() {
        this.frames = [];
        this.currentFrame = 0;
        this.data = {
            url: [],
            scale: 1,
            aspect: "native",
            rotation: 0,
            overscan: [0, 0, 0, 0],
            displayId: window.location.href.split("/").pop(),
            transition: "fade",
            duration: 10
        };
        this.displayId = window.location.href.split("/").pop();
        this.addFrame();
        var self = this;
        window.onresize = function() {
            self.reflow();
        };
        this.reflow();
        this.transition();
    };
    Shim.prototype.update = function(data) {
        //make url always an array
        if (data.url) {
            data.url = [].concat(data.url);
            this.setUrls(data.url);
        }
        this.data = Object.assign(this.data, data);
        this.reflow();
    };
    Shim.prototype.addFrame = function() {
        let div = document.createElement("div");
        div.className = "framecontainer";
        let frame = document.createElement("iframe");
        let span = document.createElement("span");
        div.appendChild(span);
        div.appendChild(frame);
        document.body.appendChild(div);
        this.frames.push(div);
        this.reflowFrame(div);
    };
    Shim.prototype.removeFrame = function() {
        let frame = this.frames.pop();
        document.body.removeChild(frame);
    };
    Shim.prototype.ensureFrames = function(count) {
        if (this.frames.length < count) {
            for (i = this.frames.length; i < count; i++) {
                this.addFrame();
            }
        }
        if (this.frames.length > count) {
            while (this.frames.length > count) {
                this.removeFrame();
            }
        }
    };
    Shim.prototype.transition = function() {
        window.setTimeout(() => {
            this.setCurrentFrame((this.currentFrame + 1) % this.frames.length);
            this.transition();
        }, this.data.duration * 1000);
    };
    Shim.prototype.setCurrentFrame = function(index) {
        this.currentFrame = index;
        this.frames.forEach((frame, i) => {
            frame.classList.toggle("current", index === i);
        });
    };
    Shim.prototype.setUrls = function(urls) {
        urls = [].concat(urls);
        this.ensureFrames(urls.length);
        urls.forEach((url, index) => {
            if (url && url !== this.data.url[index]) {
                this.setFrameUrl(this.frames[index], url);
            }
        });
    };
    Shim.prototype.setFrameUrl = function(frame, url) {
        this.setLoading(true);
        let fallback = frame.firstChild;
        let iframe = frame.lastChild;
        fallback.innerHTML = "";
        iframe.src = "about:blank";
        iframe.onload = () => {
            iframe.src = url;
            iframe.onload = () => {
                fallback.innerHTML = `${url} did not load, it might be cross origin protected`;
                this.setLoading(false);
            };
        };
    };
    Shim.prototype.setLoading = function(loading) {
        document
            .getElementById("backdrop")
            .classList.toggle("hidden", !loading);
    };
    Shim.prototype.getScale = function() {
        return this.data.zoom || 1;
    };
    Shim.prototype.getViewport = function() {
        var w =
            document.body.clientWidth -
            this.data.overscan[1] -
            this.data.overscan[3];
        var h =
            document.body.clientHeight -
            this.data.overscan[0] -
            this.data.overscan[2];
        return {
            w: w,
            h: h,
            a: w / h
        };
    };
    Shim.prototype.getAspect = function() {
        if (typeof this.data.aspect === "number") {
            return this.data.aspect;
        } else {
            return this.getViewport().a;
        }
    };
    Shim.prototype.reflowBody = function() {
        var os = this.data.overscan;
        //pixel size of the display
        var cw = document.body.clientWidth - os[1] - os[3];
        var ch = document.body.clientHeight - os[0] - os[2];
        //body style to adjust for overscan
        document.body.style.left = (os[3] - os[1]) / 2 + "px";
        document.body.style.top = (os[0] - os[2]) / 2 + "px";
    };
    Shim.prototype.reflowFrame = function(frame) {
        var vp = this.getViewport();
        var scale = this.getScale();
        this.scaleX = (vp.a * scale) / this.getAspect();
        this.scaleY = scale;
        //pixel size of the viewport (scaled)
        var bw = vp.w / this.scaleX;
        var bh = vp.h / this.scaleY;
        //size of the rotated viewport
        var width = this.data.rotation % 180 === 90 ? bh : bw;
        var height = this.data.rotation % 180 === 90 ? bw : bh;

        var style = "";
        var rotate = "rotate(" + (this.data.rotation || 0) + "deg)";
        var scaleX = "scaleX(" + this.scaleX + ")";
        var scaleY = "scaleY(" + this.scaleY + ")";
        var transform = scaleX + " " + scaleY + " " + rotate + ";";
        style += "-webkit-transform: " + transform;
        style += "-moz-transform: " + transform;
        style += "transform: " + transform;
        style += "width:" + width + "px;";
        style += "height:" + height + "px;";
        //center
        style += "margin-left:" + -width / 2 + "px;";
        style += "margin-top:" + -height / 2 + "px;";
        frame.setAttribute("style", style);
        frame.setAttribute("class", this.data.transition);
        frame.classList.add("framecontainer");
    };
    Shim.prototype.reflow = function() {
        this.frames.forEach(frame => this.reflowFrame(frame));
        this.reflowBody();
        this.setCurrentFrame(this.currentFrame);
    };

    return Shim;
})();

var shim = new Shim();

function setupChromcastV3() {
    const context = cast.framework.CastReceiverContext.getInstance();

    context.addCustomMessageListener(
        "urn:x-cast:org.firstlegoleague.castDeck",
        event => {
            var str = JSON.stringify(event);
            shim.update(event.data);

            // send something back
            context.sendCustomMessage(
                "urn:x-cast:org.firstlegoleague.castDeck",
                event.senderId,
                {
                    requestId: event.data.requestId,
                    data: shim.data,
                    event,
                    vp: shim.getViewport()
                }
            );
        }
    );

    const options = new cast.framework.CastReceiverOptions();
    options.disableIdleTimeout = true; //no timeout
    context.start(options);
}

setupChromcastV3();
