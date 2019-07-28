"use strict";
exports.__esModule = true;
var bodyParser = require("body-parser");
var express = require("express");
var LeoCoin_1 = require("./LeoCoin");
var user2user_1 = require("./user2user");
var httpPort = parseInt(process.env.HTTP_PORT) || 3001;
var p2pPort = parseInt(process.env.P2P_PORT) || 6001;
var initHttpServer = function (httpPort) {
    var app = express();
    app.use(bodyParser.json());
    app.get('/blocks', function (req, res) {
        res.send(LeoCoin_1.getBlockchain());
    });
    app.post('/mineBlock', function (req, res) {
        var newBlock = LeoCoin_1.generateNewBlock(req.body.data);
        res.send(newBlock);
    });
    app.get('/peers', function (req, res) {
        res.send(user2user_1.getSockets().map(function (s) { return s._socket.remoteAddress + ':' + s._socket.remotePort; }));
    });
    app.post('/addPeer', function (req, res) {
        user2user_1.connectToPeers(req.body.peer);
        res.send();
    });
    app.listen(httpPort, function () {
        console.log('Listening http on port: ' + httpPort);
    });
};
initHttpServer(httpPort);
user2user_1.initP2PServer(p2pPort);
