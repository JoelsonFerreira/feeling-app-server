"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = function (instance, opts, done) {
    instance.get("/", (request, reply) => { });
    instance.get("/:id", (request, reply) => { });
    instance.delete("/:id", (request, reply) => { });
    instance.patch("/:id", (request, reply) => { });
    done();
};
exports.default = router;
