"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router = function (instance, opts, done) {
    instance.get("/", function (request, reply) { });
    instance.get("/:id", function (request, reply) { });
    instance.delete("/:id", function (request, reply) { });
    instance.patch("/:id", function (request, reply) { });
    done();
};
exports.default = router;
