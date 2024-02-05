"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emit = exports.authorize = exports.clients = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const env_1 = require("../env");
exports.clients = [];
async function authorize(request) {
    const token = request.cookies['auth-token'];
    if (!token)
        return null;
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRETE_KEY);
    }
    catch (err) {
        request.log.warn(err);
        throw err;
    }
}
exports.authorize = authorize;
const ws = async function (instance, opts, done) {
    await instance.register(websocket_1.default);
    instance.addHook('preValidation', async (request, reply) => {
        const user = await authorize(request);
        if (!user) {
            await reply.code(401).send("not authenticated");
        }
    });
    instance.get('/*', { websocket: true }, async (connection, request) => {
        const user = await authorize(request);
        if (user)
            exports.clients.push({ connection, user });
    });
    done();
};
const emit = (event, data, authorId, sendTo) => {
    if (sendTo) {
        const clientsToSend = exports.clients.filter(client => client.user.id !== authorId &&
            sendTo.includes(client.user.id));
        return clientsToSend.forEach(client => client.connection.socket.send(JSON.stringify({ event, data })));
    }
    return exports.clients.forEach(client => client.user.id !== authorId &&
        client.connection.socket.send(JSON.stringify({ event, data })));
};
exports.emit = emit;
exports.default = ws;
