function cast() {
    console.log('cast');
    chrome.cast.requestSession(function() {
        console.log('has session',arguments);
    }, function() {
        console.log('has error',arguments);
    });
}

function stop() {
    console.log('stop');
}

function initCast() {
    console.log('cast api');
    var sessionRequest = new chrome.cast.SessionRequest('CA7CDAE3');
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
        function() {
            console.log('session',arguments);

        },
        function() {
            console.log('receiverListener',arguments);
        }
        // sessionListener,
        // receiverListener
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