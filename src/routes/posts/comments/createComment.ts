import clerkClient, { RequireAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import createError from 'http-errors'
import { InsertOneResult, ObjectId } from 'mongodb'
import { z } from 'zod'
import { Collections } from '../../../db/collections.js'
import { db } from '../../../db/mongo.js'
import { Post, postComment } from '../../../db/types/posts.js'

const requestBody = postComment.pick({ body: true })

type ResponseBody = InsertOneResult<Pick<Post, 'comments'>>

type RequestBody = z.infer<typeof requestBody>

export const createComment = async (
  req: RequireAuthProp<Request<{ postId: string }, ResponseBody, RequestBody>>,
  res: Response,
) => {
  requestBody.parse(req.body)

  const user = await clerkClient.users.getUser(req.auth.userId)

  const { postId } = req.params

  const dbResponse = await db.collection(Collections.Posts).updateOne(
    {
      _id: new ObjectId(postId),
    },
    {
      $push: {
        comments: {
          body: req.body.body,
          createdAt: new Date(),
          likes: 0,
          dislikes: 0,
          author: {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          },
        },
      },
    },
  )

  if (dbResponse.modifiedCount === 0) {
    return res.status(404).send(createError(404, 'post not found'))
  }

  res.send(dbResponse)
}
