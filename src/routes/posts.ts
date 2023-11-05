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
  userId: z.string(),
  title: z.string(),
  body: z.string(),
  hashtags: z.optional(z.array(z.string())),
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
      userId: user.id,
      createdAt,
      updatedAt: createdAt,
    })

    res.status(201).send(response)
  },
)
