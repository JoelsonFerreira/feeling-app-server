"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var zod_1 = require("zod");
exports.env = zod_1.z.object({
    PORT: zod_1.z.string(),
    DATABASE_URL: zod_1.z.string().url(),
    DATABASE_URL_NON_POOLING: zod_1.z.string(),
    JWT_SECRETE_KEY: zod_1.z.string(),
}).parse(process.env);
