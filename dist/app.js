"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebSocketServer = void 0;
const ws_1 = __importDefault(require("ws"));
const string_decoder_1 = require("string_decoder");
let clients = [];
function createWebSocketServer() {
    const wss = new ws_1.default.Server({ port: 8080 });
    wss.on('connection', (ws) => {
        clients.push({ socket: ws });
        ws.on('message', function message(data, isBinary) {
            const decoder = new string_decoder_1.StringDecoder('utf8');
            const buffer = new Buffer(data.toString());
            const messageData = JSON.parse(decoder.write(buffer));
            if (messageData.type === "LOGIN") {
                const currentClient = clients.find(connectedClients => connectedClients.socket === ws);
                if (currentClient)
                    currentClient.user = messageData.user;
                clients.forEach(client => client.socket.send(JSON.stringify({ type: "ONLINE", users: clients.map(client => client.user).filter(client => !!client) })));
            }
            else {
                const currentClient = clients.find(connectedClients => connectedClients.user === messageData.to);
                ws.send(data, { binary: isBinary });
                currentClient === null || currentClient === void 0 ? void 0 : currentClient.socket.send(data, { binary: isBinary });
            }
        });
        ws.on('close', () => {
            clients = clients.filter((client) => client.socket !== ws);
        });
    });
    console.log('WebSocket server started on port 8080');
}
exports.createWebSocketServer = createWebSocketServer;
createWebSocketServer();
