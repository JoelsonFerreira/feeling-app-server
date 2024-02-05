import * as jwt from "jsonwebtoken"
import type { User } from '@prisma/client';
import websocket, { type SocketStream } from '@fastify/websocket'
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

import { env } from '../env';

export let clients: { connection: SocketStream, user: User }[] = [];

export async function authorize(request: FastifyRequest) {
  const token = request.cookies['auth-token'];

  if (!token) return null;

  try {
    return jwt.verify(token, env.JWT_SECRETE_KEY) as User;
  } catch (err) {
    request.log.warn(err);
    throw err;
  }
}

const ws: FastifyPluginCallback = async function (instance, opts, done) {
  await instance.register(websocket);

  instance.addHook('preValidation', async (request, reply) => {
    const user = await authorize(request);

    if (!user) {
      await reply.code(401).send("not authenticated");
    }
  })

  instance.get('/*', { websocket: true }, async (connection, request) => {
    const user = await authorize(request);

    if (user) clients.push({ connection, user });
  })

  done()
}

type EventDispatcher =
  (
    event: "post" | "notification",
    data: {
      postId: string,
      userId: string,
      avatar?: string | null
    } | {
      type: string,
      postId: string, 
      userId: string,
    },
    authorId?: string | null,
    sendTo?: string[]
  ) => void

export const emit: EventDispatcher = (
  event: string,
  data: unknown,
  authorId?: string | null,
  sendTo?: string[]
) => {
  if (sendTo)  {
    const clientsToSend = clients.filter(client =>
      client.user.id !== authorId &&
      sendTo.includes(client.user.id)
    )

    return clientsToSend.forEach(client =>
      client.connection.socket.send(JSON.stringify({ event, data }))
    )
  }

  return clients.forEach(client =>
    client.user.id !== authorId &&
    client.connection.socket.send(JSON.stringify({ event, data }))
  )
}

export default ws;