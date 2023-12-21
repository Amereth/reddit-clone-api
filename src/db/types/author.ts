import { z } from 'zod'

export const author = z.object({
  userId: z.string(),
  firstName: z.nullable(z.string()),
  lastName: z.nullable(z.string()),
  imageUrl: z.string().url(),
})

export type Author = z.infer<typeof author>
