"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepository = void 0;
var prisma_1 = require("../lib/prisma");
var ws_1 = require("../lib/ws");
exports.postRepository = {
    viewPost: function (postId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.prisma.view.create({
                        data: {
                            postId: postId,
                            userId: userId,
                        }
                    }).catch(function () { return null; })];
            });
        });
    },
    getAll: function (userId, page) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultSize, posts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultSize = 9;
                        return [4 /*yield*/, prisma_1.prisma.post.findMany({
                                skip: page * defaultSize,
                                take: defaultSize,
                                orderBy: {
                                    createdAt: "desc"
                                }
                            })];
                    case 1:
                        posts = _a.sent();
                        return [4 /*yield*/, Promise.all(posts.map(function (post) { return post.authorId !== userId && _this.viewPost(post.id, userId); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, posts];
                }
            });
        });
    },
    getById: function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.post.findUnique({ where: { id: id } })];
                    case 1:
                        post = _a.sent();
                        if (!(post && userId && post.authorId !== userId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.viewPost(post.id, userId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, post];
                }
            });
        });
    },
    create: function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var post, user, parentPost, parentAuthorId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.post.create({ data: data })];
                    case 1:
                        post = _b.sent();
                        return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                                where: { id: data.authorId },
                                select: { avatar: true }
                            })];
                    case 2:
                        user = _b.sent();
                        if (!data.parentId) return [3 /*break*/, 4];
                        return [4 /*yield*/, prisma_1.prisma.post.findUnique({ where: { id: data.parentId }, select: { author: true } })];
                    case 3:
                        parentPost = _b.sent();
                        parentAuthorId = (_a = parentPost === null || parentPost === void 0 ? void 0 : parentPost.author) === null || _a === void 0 ? void 0 : _a.id;
                        if (parentAuthorId)
                            (0, ws_1.emit)("notification", {
                                type: "reply",
                                postId: post.id,
                                userId: data.authorId,
                            }, null, [parentAuthorId]);
                        return [3 /*break*/, 5];
                    case 4:
                        (0, ws_1.emit)("post", {
                            postId: post.id,
                            userId: data.authorId,
                            avatar: user === null || user === void 0 ? void 0 : user.avatar
                        }, data.authorId);
                        _b.label = 5;
                    case 5: return [2 /*return*/, post];
                }
            });
        });
    },
    delete: function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getById(id)];
                    case 1:
                        post = _a.sent();
                        if (!((post === null || post === void 0 ? void 0 : post.authorId) === userId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma_1.prisma.view.deleteMany({
                                where: {
                                    postId: post.id
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, prisma_1.prisma.post.delete({
                                where: {
                                    id: id
                                }
                            })];
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    },
    update: function () { },
    like: function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.prisma.like.create({ data: { postId: id, userId: userId } })];
            });
        });
    }
};
