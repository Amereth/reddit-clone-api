import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { Post } from './types.js'

export const likePost = async (req: WithAuthProp<Request>, res: Response) => {
  const { postId } = req.params

  const dbResponse = await db.collection<Post>(Collections.Posts).updateOne(
    { _id: new ObjectId(postId) },
    {
      $inc: {
        likes: 1,
      },
    },
  )

  res.send(dbResponse)
}

export const dislikePost = async (
  req: WithAuthProp<Request>,
  res: Response,
) => {
  const { postId } = req.params

  const dbResponse = await db.collection<Post>(Collections.Posts).updateOne(
    { _id: new ObjectId(postId) },
    {
      $inc: {
        dislikes: 1,
      },
    },
  )

  res.send(dbResponse)
}
