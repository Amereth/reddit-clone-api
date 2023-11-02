import clerkClient, {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  RequireAuthProp,
  WithAuthProp,
} from '@clerk/clerk-sdk-node'
import { Request, Router } from 'express'
import { z } from 'zod'
import { Collections } from '../db/collections.js'
import { db } from '../db/mongo.js'
import { sanitizeResponse } from '../utils/sanitizeResponse.js'

export const postsRouter = Router()

const post = z.object({
  title: z.string(),
  userId: z.string(),
})

type Post = z.infer<typeof post>

postsRouter.get(
  '/posts',
  ClerkExpressWithAuth(),
  async (req: WithAuthProp<Request>, res) => {
    const user = await clerkClient.users.getUser(req.auth?.userId)

    const data = await db.collection<Post>(Collections.Posts).find().toArray()

    res.send(sanitizeResponse(data))
  },
)

postsRouter.post(
  '/posts',
  ClerkExpressRequireAuth(),
  async (req: RequireAuthProp<Request>, res) => {
    post.omit({ userId: true }).parse(req.body)

    const user = await clerkClient.users.getUser(req.auth?.userId)

    const response = await db.collection<Post>(Collections.Posts).insertOne({
      title: req.body.title,
      userId: user.id,
    })

    res.status(201).send(response)
  },
)
