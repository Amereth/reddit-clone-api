import { z } from 'zod'

export const post = z.object({
  title: z.string(),
  body: z.string(),
  hashtags: z.optional(z.array(z.string())),
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
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

export const postReturned = z.object({
  title: z.string(),
  body: z.string(),
  hashtags: z.optional(z.array(z.string())),
  likes: z.object({
    total: z.number(),
    isLiked: z.boolean(),
  }),
  dislikes: z.object({
    total: z.number(),
    isLiked: z.boolean(),
  }),
  author: z.object({
    userId: z.string(),
    firstName: z.nullable(z.string()),
    lastName: z.nullable(z.string()),
    imageUrl: z.string().url(),
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type PostReturned = z.infer<typeof postReturned>
