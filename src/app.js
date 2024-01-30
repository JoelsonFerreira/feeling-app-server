"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebSocketServer = void 0;
var ws_1 = require("ws");
var string_decoder_1 = require("string_decoder");
var clients = [];
function createWebSocketServer() {
    var wss = new ws_1.default.Server({ port: 8080 });
    wss.on('connection', function (ws) {
        clients.push({ socket: ws });
        ws.on('message', function message(data, isBinary) {
            var decoder = new string_decoder_1.StringDecoder('utf8');
            var buffer = new Buffer(data.toString());
            var messageData = JSON.parse(decoder.write(buffer));
            if (messageData.type === "LOGIN") {
                var currentClient = clients.find(function (connectedClients) { return connectedClients.socket === ws; });
                if (currentClient)
                    currentClient.user = messageData.user;
                clients.forEach(function (client) { return client.socket.send(JSON.stringify({ type: "ONLINE", users: clients.map(function (client) { return client.user; }).filter(function (client) { return !!client; }) })); });
            }
            else {
                var currentClient = clients.find(function (connectedClients) { return connectedClients.user === messageData.to; });
                ws.send(data, { binary: isBinary });
                currentClient === null || currentClient === void 0 ? void 0 : currentClient.socket.send(data, { binary: isBinary });
            }
        });
        ws.on('close', function () {
            clients = clients.filter(function (client) { return client.socket !== ws; });
        });
    });
    console.log('WebSocket server started on port 8080');
}
exports.createWebSocketServer = createWebSocketServer;
createWebSocketServer();
