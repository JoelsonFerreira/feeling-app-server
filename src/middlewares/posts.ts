import type { FastifyPluginCallback, RouteHandlerMethod } from 'fastify';
import { z } from "zod";
import { Post, User } from "@prisma/client"

import { postRepository } from '../repositories/post';
import { authorize } from './auth';
import { prisma } from '../lib/prisma';
import { userRepository } from '../repositories/user';

export type PostWithRelations = Post & {
  comments: number,
  likes: number,
  views: number,
  user: User | null,
  liked: boolean,
  children: PostWithRelations[]
}

export async function getPostRelations(post: Post, userId: string): Promise<PostWithRelations> {
  return {
    ...post,
    comments: await prisma.post.count({ where: { parentId: post.id } }),
    likes: await prisma.like.count({ where: { postId: post.id } }),
    views: await prisma.view.count({ where: { postId: post.id } }),
    user: await userRepository.getById(post.authorId ?? ""),
    liked: !!await prisma.like.findFirst({ where: { userId, postId: post.id } }),
    children: await Promise.all((
      await prisma.post.findMany({ where: { parentId: post.id } })
    ).map(post => getPostRelations(post, userId)))
  }
}

const controller: {
  [key: string]: RouteHandlerMethod
} = {
  async getAll(request, reply) {
    const user = await authorize(request, reply);

    const { page } = z.object({
      page: z.coerce.number().optional().default(0)
    }).parse(request.query)
    

    return Promise.all(
      (await postRepository.getAll(user.id, page))
        .map(post => getPostRelations(post, user.id))
    );
  },

  async getById(request, reply) {
    const user = await authorize(request, reply);

    const { id } = z
      .object({ id: z.string().cuid() })
      .parse(request.params)

    const post = await postRepository.getById(id, user.id);

    if(!post) return null

    return getPostRelations(post, user.id);
  },

  async create(request, reply) {
    const user = await authorize(request, reply);
    const authorId = user.id

    const {
      parentId,
      status,
    } = z
      .object({
        status: z.string(),
        parentId: z.string().cuid().nullable()
      })
      .parse(request.body)

    return postRepository.create({
      parentId,
      status, 
      authorId 
    })
  },

  async like(request, reply) {
    const user = await authorize(request, reply);
    const authorId = user.id

    const { postId } = z
      .object({
        postId: z.string().cuid(),
      })
      .parse(request.body)

    return postRepository.like(postId, authorId)
  },

  async delete(request, reply) {
    const user = await authorize(request, reply);

    const { id } = z
      .object({ id: z.string().cuid() })
      .parse(request.params)

    const deletedPost = await postRepository.delete(id, user.id)

    if (!deletedPost) {
      reply.status(403)

      throw new Error("Forbidden");
    }

    return deletedPost;
  },

  update(request, reply) { },
}

const router: FastifyPluginCallback = async function (instance, opts, done) {
  instance
    .get("/", controller.getAll)
    .get("/:id", controller.getById)
    .post("/", controller.create)
    .post("/like", controller.like)
    .delete("/:id", controller.delete)
    .patch("/:id", controller.update)

  done()
}

export default router;