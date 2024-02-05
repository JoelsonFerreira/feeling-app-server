import { z } from "zod";

export const env = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string().url(),
  DATABASE_URL_NON_POOLING: z.string(),
  JWT_SECRETE_KEY: z.string(),
}).parse(process.env);