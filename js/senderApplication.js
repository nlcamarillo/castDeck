function cast() {
    console.log('cast');
    chrome.cast.requestSession(function(session) {
        console.log('has session',arguments);
        session.sendMessage(
            'urn:x-cast:org.firstlegoleague.castDeck',
            'hello world',
            function() {
                console.log('msg sent')
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
        )
    }, function() {
        console.log('has error',arguments);
    });
}

function stop() {
    console.log('stop');
}

function initCast() {
    console.log('cast api');
    var sessionRequest = new chrome.cast.SessionRequest('4EC978AD');
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
        function() {
            console.log('session',arguments);

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