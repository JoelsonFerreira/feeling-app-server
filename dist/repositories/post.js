"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepository = void 0;
const prisma_1 = require("../lib/prisma");
const ws_1 = require("../lib/ws");
exports.postRepository = {
    async viewPost(postId, userId) {
        return prisma_1.prisma.view.create({
            data: {
                postId,
                userId,
            }
        }).catch(() => null);
    },
    async getAll(userId, page) {
        const defaultSize = 9;
        const posts = await prisma_1.prisma.post.findMany({
            skip: page * defaultSize,
            take: defaultSize,
            orderBy: {
                createdAt: "desc"
            }
        });
        await Promise.all(posts.map((post) => post.authorId !== userId && this.viewPost(post.id, userId)));
        return posts;
    },
    async getById(id, userId) {
        const post = await prisma_1.prisma.post.findUnique({ where: { id } });
        if (post && userId && post.authorId !== userId)
            await this.viewPost(post.id, userId);
        return post;
    },
    async create(data) {
        var _a;
        const post = await prisma_1.prisma.post.create({ data });
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: data.authorId },
            select: { avatar: true }
        });
        if (data.parentId) {
            const parentPost = await prisma_1.prisma.post.findUnique({ where: { id: data.parentId }, select: { author: true } });
            const parentAuthorId = (_a = parentPost === null || parentPost === void 0 ? void 0 : parentPost.author) === null || _a === void 0 ? void 0 : _a.id;
            if (parentAuthorId)
                (0, ws_1.emit)("notification", {
                    type: "reply",
                    postId: post.id,
                    userId: data.authorId,
                }, null, [parentAuthorId]);
        }
        else
            (0, ws_1.emit)("post", {
                postId: post.id,
                userId: data.authorId,
                avatar: user === null || user === void 0 ? void 0 : user.avatar
            }, data.authorId);
        return post;
    },
    async delete(id, userId) {
        const post = await this.getById(id);
        if ((post === null || post === void 0 ? void 0 : post.authorId) === userId) {
            await prisma_1.prisma.view.deleteMany({
                where: {
                    postId: post.id
                }
            });
            return prisma_1.prisma.post.delete({
                where: {
                    id
                }
            });
        }
        return null;
    },
    update() { },
    async like(id, userId) {
        return prisma_1.prisma.like.create({ data: { postId: id, userId } });
    }
};
