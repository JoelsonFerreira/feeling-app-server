"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const env_1 = require("./env");
const ws_1 = __importDefault(require("./lib/ws"));
const posts_1 = __importDefault(require("./middlewares/posts"));
const messages_1 = __importDefault(require("./middlewares/messages"));
const auth_1 = __importStar(require("./middlewares/auth"));
async function main() {
    const DEFAULT_PORT = 8080;
    const ENV_PORT = Number(env_1.env.PORT);
    const PORT = isNaN(ENV_PORT) ? DEFAULT_PORT : ENV_PORT;
    const server = (0, fastify_1.default)({ logger: false });
    await server.register(cookie_1.default, { secret: 'your-secret-key' });
    await server.register(cors_1.default, { origin: "http://localhost:3000", credentials: true });
    await server.register(ws_1.default);
    server.decorate("auth", auth_1.authorize);
    server
        .register(posts_1.default, { prefix: "/posts" })
        .register(messages_1.default, { prefix: "/messages" })
        .register(auth_1.default, { prefix: "/auth" });
    server
        .listen({ port: PORT })
        .then(() => console.log(`[server] running on http://localhost:${PORT}/`));
}
main();
