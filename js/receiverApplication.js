function setupChromcast() {
    var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    var customMessageBus = castReceiverManager.getCastMessageBus(
        'urn:x-cast:org.firstlegoleague.castDeck',
        cast.receiver.CastMessageBus.MessageType.JSON
    );
    customMessageBus.onMessage = function(event) {
        console.log(event);
        //send something back
        // customMessageBus.send(event.senderId,{
        //     requestId: event.data.requestId,
        //     data: 'foo'
        // });
    };
    castReceiverManager.start();
}

setupChromcast();