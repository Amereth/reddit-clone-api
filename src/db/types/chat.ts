import { z } from 'zod'
import { author } from './author.js'

export const chatMessage = z.object({
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
  author,
})

export type ChatMessage = z.infer<typeof chatMessage>
