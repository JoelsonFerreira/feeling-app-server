import { prisma } from "../lib/prisma"
import { emit } from "../lib/ws"

export const postRepository = {
  async viewPost(postId: string, userId: string) {
    return prisma.view.create({
      data: {
        postId,
        userId,
      }
    }).catch(() => null)
  },

  async getAll(userId: string, page: number) {
    const defaultSize = 9

    const posts = await prisma.post.findMany({
      skip: page * defaultSize,
      take: defaultSize,
      orderBy: {
        createdAt: "desc"
      }
    });

    await Promise.all(posts.map((post) => post.authorId !== userId && this.viewPost(post.id, userId)))

    return posts;
  },

  async getById(id: string, userId?: string) {
    const post = await prisma.post.findUnique({ where: { id } });

    if (post && userId && post.authorId !== userId)
      await this.viewPost(post.id, userId);

    return post;
  },

  async create(data: {
    status: string,
    authorId: string,
    parentId: string | null,
  }) {
    const post = await prisma.post.create({ data })
    const user = await prisma.user.findUnique({ 
      where: { id: data.authorId }, 
      select: { avatar: true } 
    })

    if(data.parentId) {
      const parentPost = await prisma.post.findUnique({ where: { id: data.parentId }, select: { author: true } })
      const parentAuthorId = parentPost?.author?.id;

      if(parentAuthorId) 
        emit("notification", { 
          type: "reply",
          postId: post.id, 
          userId: data.authorId,
        }, null, [parentAuthorId])
    } else 
      emit("post", { 
        postId: post.id, 
        userId: data.authorId, 
        avatar: user?.avatar 
      }, data.authorId)

    return post;
  },

  async delete(id: string, userId: string) {
    const post = await this.getById(id);

    if (post?.authorId === userId) {
      await prisma.view.deleteMany({
        where: {
          postId: post.id
        }
      })

      return prisma.post.delete({
        where: {
          id
        }
      })
    }

    return null;
  },

  update() { },

  async like(id: string, userId: string) {
    return prisma.like.create({ data: { postId: id, userId } });
  }
}