import type { FastifyPluginCallback, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { z } from "zod";

import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

import { userRepository } from '../repositories/user';
import { env } from '../env';

const controller: {
  [key: string]: RouteHandlerMethod
} = {
  async login(request, reply) {    
    const { username, password } = z
      .object({
        username: z.string(),
        password: z.string(),
      })
      .parse(request.body)
    
    const user = await userRepository.getById(username);

    if (!user) {
      reply.status(404);

      throw new Error('User not found!');
    }

    const { password: hash, ...payload } = user;

    if (bcrypt.compareSync(password, hash)) {
      const token = jwt.sign(payload, env.JWT_SECRETE_KEY)

      reply.setCookie('auth-token', token, {
        path: '/',
        domain: 'localhost',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: false,
        httpOnly: true,
        sameSite: false,
      })

      return { token }
    }

    reply.status(401);

    throw new Error('Unauthorized!');
  },

  async logout(request, reply) {
    reply.clearCookie('auth-token')

    return {};
  },

  async register(request, reply) {
    const { 
      password, 
      email,
      id,
      name,
    } = z
      .object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        password: z.string(),
      })
      .parse(request.body)

    const { password: _, ...user } = await userRepository.create({ 
      email,
      id,
      name, 
      password: bcrypt.hashSync(password, 16) 
    })

    return user;
  },

  async getUser(request, reply) {
    const user = await authorize(request, reply);

    return user;
  }
}

const router: FastifyPluginCallback = function (instance, opts, done) {
  instance.post("/login", controller.login)
  instance.post("/logout", controller.logout)
  instance.post("/register", controller.register)
  instance.get("/user", controller.getUser)
  // instance.delete("/users/:id", controller.login)
  // instance.patch("/users/:id", controller.login)

  done()
}

export default router;

type User = {
  id: string
  avatar: string | null
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export async function authorize(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies['auth-token'];

  if (!token) {
    reply.status(401)
    throw new Error('Unauthorized: missing session cookie');
  }
 
  let user;
  try {
    user = jwt.verify(token, env.JWT_SECRETE_KEY);
  } catch (err) {
    request.log.warn(err);
    throw err;
  }
 
  return user as User;
}