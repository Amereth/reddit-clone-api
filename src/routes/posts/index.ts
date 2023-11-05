import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
} from '@clerk/clerk-sdk-node'
import { Router } from 'express'
import { z } from 'zod'
import { getPosts } from './getPosts.js'

export const postsRouter = Router()

postsRouter.get('/', ClerkExpressWithAuth(), getPosts)
postsRouter.post('/', ClerkExpressRequireAuth(), getPosts)

export const post = z.object({
  title: z.string(),
  body: z.string(),
  hashtags: z.optional(z.array(z.string())),
  likes: z.number().default(0),
  dislikes: z.number().default(0),
  author: z.object({
    userId: z.string(),
    firstName: z.nullable(z.string()),
    lastName: z.nullable(z.string()),
    imageUrl: z.string().url(),
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Post = z.infer<typeof post>