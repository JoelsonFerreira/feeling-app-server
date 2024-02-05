import { prisma } from "../lib/prisma"
import { emit } from "../lib/ws"

export const userRepository = {
  getAll() {
    return prisma.user.findMany();
  },

  getById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: {
    id: string,
    email: string,
    name: string,
    password: string,
  }) {
    return prisma.user.create({ data })
  },

  delete() { },

  update() { },
}