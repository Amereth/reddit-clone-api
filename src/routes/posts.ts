import clerkClient, {
  ClerkExpressWithAuth,
  WithAuthProp,
} from '@clerk/clerk-sdk-node'
import { Request, Router } from 'express'
import { db } from '../db/mongo.js'

export const postsRouter = Router()

type Post = {
  test: string
}

postsRouter.get(
  '/',
  ClerkExpressWithAuth(),
  async (req: WithAuthProp<Request>, res) => {
    const user = await clerkClient.users.getUser(req.auth?.userId)

    const data = await db.collection<Post>('posts').find().toArray()

    res.send(data)
  },
)
