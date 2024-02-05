"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_1 = require("../lib/prisma");
exports.userRepository = {
    getAll() {
        return prisma_1.prisma.user.findMany();
    },
    getById(id) {
        return prisma_1.prisma.user.findUnique({ where: { id } });
    },
    create(data) {
        return prisma_1.prisma.user.create({ data });
    },
    delete() { },
    update() { },
};
