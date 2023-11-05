import clerkClient, {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  RequireAuthProp,
  WithAuthProp,
} from '@clerk/clerk-sdk-node'
import { Request, Router } from 'express'
import { pick } from 'rambda'
import { z } from 'zod'
import { Collections } from '../db/collections.js'
import { db } from '../db/mongo.js'
import { getZodSchemaKeys } from '../utils/getZodSchemaKeys.js'
import { sanitizeResponse } from '../utils/sanitizeResponse.js'

export const postsRouter = Router()

const post = z.object({
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
type Post = z.infer<typeof post>

const postBody = post.pick({ title: true, body: true, hashtags: true })
type PostBody = z.infer<typeof postBody>

postsRouter.get(
  '/posts',
  ClerkExpressWithAuth(),
  async (req: WithAuthProp<Request>, res) => {
    const data = await db.collection<Post>(Collections.Posts).find().toArray()

    res.send(sanitizeResponse(data))
  },
)

postsRouter.post(
  '/posts',
  ClerkExpressRequireAuth(),
  async (req: RequireAuthProp<Request>, res) => {
    postBody.parse(req.body)

    const user = await clerkClient.users.getUser(req.auth?.userId)

    const body = pick(getZodSchemaKeys(post), req.body) as PostBody

    const createdAt = new Date()

    const response = await db.collection<Post>(Collections.Posts).insertOne({
      ...body,
      likes: 0,
      dislikes: 0,
      author: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
      createdAt,
      updatedAt: createdAt,
    })

    res.status(201).send(response)
  },
)
