(function(root) {
    var session;
    var API_ID = "4EC978AD"; //prod

    function spread() {
        return Object.assign.apply([{}].concat(arguments));
    }

    function CastDeck(options) {
        var castDeck = this;
        this.options = options || {};
        this.state = {
            zoom: 1,
            rotation: 0,
            url: "",
            overscan: [0, 0, 0, 0],
            aspect: "native",
            transition: "fade",
            duration: 10
        };

        const log = function() {
            if (castDeck.options.log) {
                console.log.apply(console, arguments);
            }
        };

        const checkApi = function() {
            if (!(chrome && chrome.cast)) {
                console.error(
                    "google cast api not found, please include www.gstatic.com/cv/js/sender/v1/cast_sender.js"
                );
            }
        };

        const update = fn => value => {
            fn(value);
            return this.sendMessage(this.state);
        };

        this.cast = function(url, cb) {
            checkApi();
            log("cast");
            return new Promise((resolve, reject) => {
                chrome.cast.requestSession(_session => {
                    log("has session", _session);

                    session = _session;

                    session.addMessageListener(
                        "urn:x-cast:org.firstlegoleague.castDeck",
                        function(namespace, data) {
                            log("received message", data);
                            cb && cb.apply(cb, arguments);
                        }
                    );
                    if (url && url[0]) {
                        resolve(this.updateUrl(url));
                    } else {
                        //sending empty message
                        this.sendMessage({}).then(() => {
                            resolve();
                        });
                    }
                }, reject);
            });
        };

        this.stop = function() {
            log("stop");
            session.stop();
        };

        this.sendMessage = function(obj) {
            return new Promise((resolve, reject) => {
                log("sending", obj);
                session.sendMessage(
                    "urn:x-cast:org.firstlegoleague.castDeck",
                    JSON.stringify(obj),
                    () => resolve(obj),
                    reject
                );
            });
        };

        this.setZoom = update(value => (this.state.zoom = value));
        this.zoomIn = () => this.setZoom(this.state.zoom + 0.1);
        this.zoomOut = () => this.setZoom(this.state.zoom - 0.1);
        this.zoomReset = () => this.setZoom(1);

        const rotateDelta = update(
            delta =>
                (this.state.rotation =
                    (this.state.rotation + delta + 360) % 360)
        );
        this.rotateCCW = () => rotateDelta(-90);
        this.rotateCW = () => rotateDelta(90);

        this.updateUrl = update(value => (this.state.url = value));

        const adjustOverscan = index =>
            update(value => (this.state.overscan[index] = value));
        this.adjustTop = adjustOverscan(0);
        this.adjustRight = adjustOverscan(1);
        this.adjustBottom = adjustOverscan(2);
        this.adjustLeft = adjustOverscan(3);

        this.updateAspect = update(value => (this.state.aspect = value));

        this.updateTransition = update(
            value => (this.state.transition = value)
        );
        this.updateDuration = update(
            value => (this.state.duration = parseInt(value, 10))
        );

        this.initCast = function() {
            log("initinig cast api");
            var sessionRequest = new chrome.cast.SessionRequest(API_ID);
            var apiConfig = new chrome.cast.ApiConfig(
                sessionRequest,
                _session => {
                    session = _session;
                    log("has config", session);
                },
                receiver => log("has receiver", receiver)
            );
            chrome.cast.initialize(
                apiConfig,
                () => log("cast init success"),
                err => log("cast init error", err)
            );
        };
    }

    var urlList = [""];
    root.helpers = {
        addUrl() {
            urlList = this.getUrls();
            urlList.push("");
            this.renderUrls();
        },
        removeUrl(index) {
            urlList = this.getUrls();
            urlList.splice(index, 1);
            this.renderUrls();
        },
        getUrls() {
            let list = Array.from(document.getElementsByName("url")).map(
                input => input.value
            );
            console.log(list);
            return list;
        },
        renderUrls() {
            let div = document.getElementById("urls");
            div.innerHTML = urlList
                .map((url, index) => {
                    let last = index === urlList.length - 1;
                    let rem = `
                    <button type="button" onclick="helpers.removeUrl(${index})">
                        <i class="mdi mdi-delete"></i>
                        Remove
                    </button>
                `;
                    let add = `
                    <button type="button" onclick="helpers.addUrl()">
                        <i class="mdi mdi-plus"></i>
                        Add url
                    </button>
                    <button type="button" onclick="castDeck.updateUrl(helpers.getUrls())">Update</button>
                `;
                    return `
                    <p>
                        <label for="url${index}">url ${index + 1}</label>
                        <input id="url${index}" name="url" type="text" value="${url}">
                        ${last ? add : rem}
                    </p>
                `;
                })
                .join("");
        }
    };

    root.castDeck = new CastDeck();
    document.addEventListener("DOMContentLoaded", () => {
        root.helpers.renderUrls();
    });

    window["__onGCastApiAvailable"] = function(loaded, errorInfo) {
        if (loaded) {
            root.castDeck.initCast();
        } else {
            console.log(errorInfo);
        }
    };
})(window);
