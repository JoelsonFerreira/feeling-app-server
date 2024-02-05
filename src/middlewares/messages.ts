import type { FastifyPluginCallback } from 'fastify';

const router: FastifyPluginCallback = function (instance, opts, done) {
  instance.get("/", (request, reply) => {})
  instance.get("/:id", (request, reply) => {})
  instance.delete("/:id", (request, reply) => {})
  instance.patch("/:id", (request, reply) => {})

  done()
}

export default router;