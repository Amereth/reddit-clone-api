import { z } from 'zod'
import { author } from './author.js'

export const post = z.object({
  title: z.string(),
  body: z.string(),
  hashtags: z.optional(z.array(z.string())),
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  author,
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  // comments: z.array(
  //   z.object({
  //     body: z.string(),
  //     date: z.date(),
  //     author: z.object({
  //       userId: z.string(),
  //       firstName: z.nullable(z.string()),
  //       lastName: z.nullable(z.string()),
  //       imageUrl: z.string().url(),
  //     }),
  //     likes: z.array(z.string()).default([]),
  //     dislikes: z.array(z.string()).default([]),
  //   }),
  // ),
})

export type Post = z.infer<typeof post>
