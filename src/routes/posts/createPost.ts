import clerkClient, {
  ClerkExpressRequireAuth,
  RequireAuthProp,
} from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { pick } from 'rambda'
import { z } from 'zod'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { getZodSchemaKeys } from '../../utils/getZodSchemaKeys.js'
import { postsRouter, post, Post } from './index.js'

const postBody = post.pick({ title: true, body: true, hashtags: true })
type PostBody = z.infer<typeof postBody>

export const createPost = async (
  req: RequireAuthProp<Request>,
  res: Response,
) => {
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
}
