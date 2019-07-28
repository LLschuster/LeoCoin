"use strict";
exports.__esModule = true;
var WebSocket = require("ws");
var LeoCoin_1 = require("./LeoCoin");
var sockets = [];
var MessageType;
(function (MessageType) {
    MessageType[MessageType["QUERY_LATEST"] = 0] = "QUERY_LATEST";
    MessageType[MessageType["QUERY_ALL"] = 1] = "QUERY_ALL";
    MessageType[MessageType["RESPONSE_BLOCKCHAIN"] = 2] = "RESPONSE_BLOCKCHAIN";
})(MessageType || (MessageType = {}));
var Message = /** @class */ (function () {
    function Message() {
    }
    return Message;
}());
var initP2PServer = function (p2pPort) {
    var server = new WebSocket.Server({ port: p2pPort });
    server.on('connection', function (ws) {
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
};
exports.initP2PServer = initP2PServer;
var getSockets = function () { return sockets; };
exports.getSockets = getSockets;
var initConnection = function (ws) {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};
var JSONToObject = function (data) {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
var initMessageHandler = function (ws) {
    ws.on('message', function (data) {
        var message = JSONToObject(data);
        if (message === null) {
            console.log('could not parse received JSON message: ' + data);
            return;
        }
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                var receivedBlocks = JSONToObject(message.data);
                if (receivedBlocks === null) {
                    console.log('invalid blocks received:');
                    console.log(message.data);
                    break;
                }
                handleBlockchainResponse(receivedBlocks);
                break;
        }
    });
};
var write = function (ws, message) { return ws.send(JSON.stringify(message)); };
var broadcast = function (message) { return sockets.forEach(function (socket) { return write(socket, message); }); };
var queryChainLengthMsg = function () { return ({ 'type': MessageType.QUERY_LATEST, 'data': null }); };
var queryAllMsg = function () { return ({ 'type': MessageType.QUERY_ALL, 'data': null }); };
var responseChainMsg = function () { return ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(LeoCoin_1.getBlockchain())
}); };
var responseLatestMsg = function () { return ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([LeoCoin_1.getPreviousBlock()])
}); };
var initErrorHandler = function (ws) {
    var closeConnection = function (myWs) {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', function () { return closeConnection(ws); });
    ws.on('error', function () { return closeConnection(ws); });
};
var handleBlockchainResponse = function (receivedBlocks) {
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    if (!LeoCoin_1.isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }
    var latestBlockHeld = LeoCoin_1.getPreviousBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (LeoCoin_1.addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        }
        else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        }
        else {
            console.log('Received blockchain is longer than current blockchain');
            LeoCoin_1.replaceChain(receivedBlocks);
        }
    }
    else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};
var broadcastLatest = function () {
    broadcast(responseLatestMsg());
};
exports.broadcastLatest = broadcastLatest;
var connectToPeers = function (newPeer) {
    var ws = new WebSocket(newPeer);
    ws.on('open', function () {
        initConnection(ws);
    });
    ws.on('error', function () {
        console.log('connection failed');
    });
};
exports.connectToPeers = connectToPeers;
