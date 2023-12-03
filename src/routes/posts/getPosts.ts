import { WithAuthProp } from '@clerk/clerk-sdk-node'
import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { sanitizeResponse } from '../../utils/sanitizeResponse.js'
import { Post } from './types.js'

export const getPosts = async (
  req: WithAuthProp<Request<{ hashtag?: string; date?: string }>>,
  res: Response,
) => {
  const { hashtag, date } = req.query as { hashtag?: string; date?: string }

  const lteDate = dayjs(date).add(1, 'day').toDate()

  const data = await db
    .collection<Post>(Collections.Posts)
    .find({
      hashtags: hashtag ? hashtag : { $exists: true },
      createdAt: date
        ? {
            $gte: new Date(date),
            $lte: lteDate,
          }
        : { $exists: true },
    })
    .toArray()

  const responseData = data.map((post) => ({
    ...post,
    likes: {
      total: post.likes.length,
      isLiked: post.likes.includes(req.auth?.userId),
    },
    dislikes: {
      total: post.dislikes.length,
      isLiked: post.dislikes.includes(req.auth?.userId),
    },
  }))

  res.send(sanitizeResponse(responseData))
}
