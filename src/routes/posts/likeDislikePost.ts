import clerkClient, { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { Post } from './types.js'

type CreateHandlerArg =
  | {
      primaryAction: 'likes'
      secondaryAction: 'dislikes'
    }
  | {
      primaryAction: 'dislikes'
      secondaryAction: 'likes'
    }

const createHandler =
  ({ primaryAction, secondaryAction }: CreateHandlerArg) =>
  async (req: WithAuthProp<Request>, res: Response) => {
    const { postId } = req.params

    const user = await clerkClient.users.getUser(req.auth?.userId)

    // if user has already liked post, remove like
    const dbResponse = await db.collection<Post>(Collections.Posts).updateOne(
      {
        _id: new ObjectId(postId),
        [primaryAction]: { $in: [user.id] },
      },
      { $pull: { [primaryAction]: user.id } },
    )

    // if user has not liked post, add like and remove dislike
    if (dbResponse.modifiedCount === 0) {
      const dbResponse = await db.collection<Post>(Collections.Posts).updateOne(
        { _id: new ObjectId(postId) },
        {
          $push: { [primaryAction]: user.id },
          $pull: { [secondaryAction]: user.id },
        },
      )
      res.send(dbResponse)
    }

    res.send(dbResponse)
  }

export const likePost = createHandler({
  primaryAction: 'likes',
  secondaryAction: 'dislikes',
})

export const dislikePost = createHandler({
  primaryAction: 'dislikes',
  secondaryAction: 'likes',
})
