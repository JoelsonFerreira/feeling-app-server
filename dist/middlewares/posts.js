"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostRelations = void 0;
const zod_1 = require("zod");
const post_1 = require("../repositories/post");
const auth_1 = require("./auth");
const prisma_1 = require("../lib/prisma");
const user_1 = require("../repositories/user");
async function getPostRelations(post, userId) {
    var _a;
    return Object.assign(Object.assign({}, post), { comments: await prisma_1.prisma.post.count({ where: { parentId: post.id } }), likes: await prisma_1.prisma.like.count({ where: { postId: post.id } }), views: await prisma_1.prisma.view.count({ where: { postId: post.id } }), user: await user_1.userRepository.getById((_a = post.authorId) !== null && _a !== void 0 ? _a : ""), liked: !!await prisma_1.prisma.like.findFirst({ where: { userId, postId: post.id } }), children: await Promise.all((await prisma_1.prisma.post.findMany({ where: { parentId: post.id } })).map(post => getPostRelations(post, userId))) });
}
exports.getPostRelations = getPostRelations;
const controller = {
    async getAll(request, reply) {
        const user = await (0, auth_1.authorize)(request, reply);
        const { page } = zod_1.z.object({
            page: zod_1.z.coerce.number().optional().default(0)
        }).parse(request.query);
        return Promise.all((await post_1.postRepository.getAll(user.id, page))
            .map(post => getPostRelations(post, user.id)));
    },
    async getById(request, reply) {
        const user = await (0, auth_1.authorize)(request, reply);
        const { id } = zod_1.z
            .object({ id: zod_1.z.string().cuid() })
            .parse(request.params);
        const post = await post_1.postRepository.getById(id, user.id);
        if (!post)
            return null;
        return getPostRelations(post, user.id);
    },
    async create(request, reply) {
        const user = await (0, auth_1.authorize)(request, reply);
        const authorId = user.id;
        const postData = zod_1.z
            .object({
            status: zod_1.z.string(),
            parentId: zod_1.z.string().cuid().nullable()
        })
            .parse(request.body);
        return post_1.postRepository.create(Object.assign(Object.assign({}, postData), { authorId }));
    },
    async like(request, reply) {
        const user = await (0, auth_1.authorize)(request, reply);
        const authorId = user.id;
        const { postId } = zod_1.z
            .object({
            postId: zod_1.z.string().cuid(),
        })
            .parse(request.body);
        return post_1.postRepository.like(postId, authorId);
    },
    async delete(request, reply) {
        const user = await (0, auth_1.authorize)(request, reply);
        const { id } = zod_1.z
            .object({ id: zod_1.z.string().cuid() })
            .parse(request.params);
        const deletedPost = await post_1.postRepository.delete(id, user.id);
        if (!deletedPost) {
            reply.status(403);
            throw new Error("Forbidden");
        }
        return deletedPost;
    },
    update(request, reply) { },
};
const router = async function (instance, opts, done) {
    instance
        .get("/", controller.getAll)
        .get("/:id", controller.getById)
        .post("/", controller.create)
        .post("/like", controller.like)
        .delete("/:id", controller.delete)
        .patch("/:id", controller.update);
    done();
};
exports.default = router;
