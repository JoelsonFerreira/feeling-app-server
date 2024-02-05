"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../repositories/user");
const env_1 = require("../env");
const controller = {
    async login(request, reply) {
        const { username, password } = zod_1.z
            .object({
            username: zod_1.z.string(),
            password: zod_1.z.string(),
        })
            .parse(request.body);
        const user = await user_1.userRepository.getById(username);
        if (!user) {
            reply.status(404);
            throw new Error('User not found!');
        }
        const { password: hash } = user, payload = __rest(user, ["password"]);
        if (bcrypt_1.default.compareSync(password, hash)) {
            const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRETE_KEY);
            reply.setCookie('auth-token', token, {
                path: '/',
                domain: 'localhost',
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                secure: false,
                httpOnly: true,
                sameSite: false,
            });
            return { token };
        }
        reply.status(401);
        throw new Error('Unauthorized!');
    },
    async logout(request, reply) {
        reply.clearCookie('auth-token');
        return {};
    },
    async register(request, reply) {
        const _a = zod_1.z
            .object({
            id: zod_1.z.string(),
            email: zod_1.z.string(),
            name: zod_1.z.string(),
            password: zod_1.z.string(),
        })
            .parse(request.body), { password } = _a, data = __rest(_a, ["password"]);
        const _b = await user_1.userRepository.create(Object.assign(Object.assign({}, data), { password: bcrypt_1.default.hashSync(password, 16) })), { password: _ } = _b, user = __rest(_b, ["password"]);
        return user;
    },
    async getUser(request, reply) {
        const user = await authorize(request, reply);
        return user;
    }
};
const router = function (instance, opts, done) {
    instance.post("/login", controller.login);
    instance.post("/logout", controller.logout);
    instance.post("/register", controller.register);
    instance.get("/user", controller.getUser);
    // instance.delete("/users/:id", controller.login)
    // instance.patch("/users/:id", controller.login)
    done();
};
exports.default = router;
async function authorize(request, reply) {
    const token = request.cookies['auth-token'];
    if (!token) {
        reply.status(401);
        throw new Error('Unauthorized: missing session cookie');
    }
    let user;
    try {
        user = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRETE_KEY);
    }
    catch (err) {
        request.log.warn(err);
        throw err;
    }
    return user;
}
exports.authorize = authorize;
