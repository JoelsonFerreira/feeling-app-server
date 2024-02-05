import fastify from "fastify"

import fastifyCookie from "@fastify/cookie";
import cors from '@fastify/cors'

import { env } from "./env";
import ws from './lib/ws'

import posts from "./middlewares/posts";
import messages from "./middlewares/messages";
import auth, { authorize } from "./middlewares/auth";

async function main() {
  const DEFAULT_PORT = 8080;
  const ENV_PORT = Number(env.PORT);
  const PORT = isNaN(ENV_PORT) ? DEFAULT_PORT : ENV_PORT;

  const server = fastify({ logger: false });

  await server.register(fastifyCookie, { secret: 'your-secret-key' });
  await server.register(cors, { origin: "http://localhost:3000", credentials: true });
  await server.register(ws);

  server.decorate("auth", authorize)

  server
    .register(posts, { prefix: "/posts" })
    .register(messages, { prefix: "/messages" })
    .register(auth, { prefix: "/auth" });

  server
    .listen({ port: PORT })
    .then(() => console.log(`[server] running on http://localhost:${PORT}/`));
}

main();