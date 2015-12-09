var session;
var zoom = 1;
var rotation = 0;
var url;
var overscan = [0,0,0,0];

function cast(cb) {
    console.log('cast');
    chrome.cast.requestSession(function(_session) {
        console.log('has session',arguments);

        session = _session;

        session.sendMessage(
            'urn:x-cast:org.firstlegoleague.castDeck',
            'hello world',
            function() {
                console.log('msg sent');
            },
            function() {
                console.log('msg err');
            }
        );
        session.addMessageListener(
            'urn:x-cast:org.firstlegoleague.castDeck',
            function() {
                console.log('got msg',arguments);
            }
        );
        if (cb) {
            cb();
        }
    }, function() {
        console.log('has error',arguments);
    });
}

function sendMessage(obj) {
    var str = JSON.stringify(obj);
    session.sendMessage(
        'urn:x-cast:org.firstlegoleague.castDeck',
        str,
        function() {
            console.log('update sent');
        },
        function() {
            console.log('update err');
        }
    );
}

function sendUpdate() {
    sendMessage({
        url: url,
        rotation: rotation,
        zoom: zoom,
        aspect: 'native',
        overscan: overscan
    });
}

function stop() {
    console.log('stop');
    session.stop();
}

function setZoom(z) {
    zoom = z;
    document.getElementById('zoomLevel').innerHTML = zoom.toFixed(1);
    sendUpdate();
}

function zoomIn() {
    setZoom(zoom + 0.1);
}

function zoomOut() {
    setZoom(zoom - 0.1);
}

function zoomReset() {
    setZoom(1);
}

function rotateCCW() {
    rotation = (rotation+270) % 360;
    sendUpdate();
}

function rotateCW() {
    rotation = (rotation+90) % 360;
    sendUpdate();
}

function updateUrl() {
    url = document.getElementById('url').value;
    sendUpdate();
}

function adjustTop(value) {
    overscan[0] = value;
    sendUpdate();
}
function adjustRight(value) {
    overscan[1] = value;
    sendUpdate();
}
function adjustBottom(value) {
    overscan[2] = value;
    sendUpdate();
}
function adjustLeft(value) {
    overscan[3] = value;
    sendUpdate();
}

function initCast() {
    console.log('cast api');
    var sessionRequest = new chrome.cast.SessionRequest('4EC978AD');
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
        function(_session) {
            console.log('existing session',arguments);
            session = _session;
        },
        function() {
            console.log('receiverListener',arguments);
        }
    );
    chrome.cast.initialize(apiConfig,
        function() {
            console.log('init success');
        }, function() {
            console.log('init error');
        }
    );
}

window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
    if (loaded) {
        initCast();
    } else {
        console.log(errorInfo);
    }
};