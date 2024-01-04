import { z } from 'zod'
import { author } from './author.js'

export const postComment = z.object({
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  body: z
    .string()
    .min(1, 'comment must be at least 1 character long')
    .max(1000, 'comment must be less than 1000 characters long'),
  likes: z.number().default(0),
  dislikes: z.number().default(0),
  author,
})

export type PostComment = z.infer<typeof postComment>

export const post = z.object({
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  title: z
    .string()
    .min(3, 'comment must be at least 3 character long')
    .max(1000, 'comment must be less than 1000 characters long'),
  body: z
    .string()
    .min(10, 'comment must be at least 10 character long')
    .max(1000, 'comment must be less than 1000 characters long'),
  hashtags: z.optional(z.array(z.string())),
  likes: z.number().default(0),
  dislikes: z.number().default(0),
  imageUrl: z.string().optional(),
  comments: z.array(postComment),
  author,
})

export type Post = z.infer<typeof post>
