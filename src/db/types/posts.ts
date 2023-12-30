import { z } from 'zod'
import { author } from './author.js'

export const postComment = z.object({
  body: z
    .string()
    .min(1, 'comment must be at least 1 character long')
    .max(1000, 'comment must be less than 1000 characters long'),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  author,
})

export type PostComment = z.infer<typeof postComment>

export const post = z.object({
  title: z
    .string()
    .min(3, 'comment must be at least 3 character long')
    .max(1000, 'comment must be less than 1000 characters long'),
  body: z
    .string()
    .min(10, 'comment must be at least 10 character long')
    .max(1000, 'comment must be less than 1000 characters long'),
  hashtags: z.optional(z.array(z.string())),
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  author,
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  comments: z.array(postComment),
})

export type Post = z.infer<typeof post>
