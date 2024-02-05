"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
var prisma_1 = require("../lib/prisma");
exports.userRepository = {
    getAll: function () {
        return prisma_1.prisma.user.findMany();
    },
    getById: function (id) {
        return prisma_1.prisma.user.findUnique({ where: { id: id } });
    },
    create: function (data) {
        return prisma_1.prisma.user.create({ data: data });
    },
    delete: function () { },
    update: function () { },
};
