import { WithAuthProp } from '@clerk/clerk-sdk-node'
import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { sanitizeResponse } from '../../utils/sanitizeResponse.js'
import { Post } from './types.js'

type Query = {
  hashtag?: string
  date?: string
  page?: string
  perPage?: string
}

export const getPosts = async (
  req: WithAuthProp<Request<Query>>,
  res: Response,
) => {
  const { hashtag, date, page = '1', perPage = '3' } = req.query as Query

  const lteDate = dayjs(date).add(1, 'day').toDate()

  const data = await db
    .collection<Post>(Collections.Posts)
    .aggregate<{ data: Post[]; total: { total: number }[] }>([
      {
        $facet: {
          data: [
            {
              $match: {
                hashtags: hashtag ? hashtag : { $exists: true },
                createdAt: date
                  ? { $gte: new Date(date), $lte: lteDate }
                  : { $exists: true },
              },
            },
            { $skip: (Number(page) - 1) * Number(perPage) },
            { $limit: Number(perPage) },
          ],
          total: [{ $count: 'total' }],
        },
      },
    ])
    .toArray()

  const first = data[0]

  if (!first) {
    res.send(data)
    return
  }

  const responseData = {
    total: data[0]?.total[0]?.total,
    perPage: Number(perPage),
    data: first.data
      .map((post) => ({
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
      .map(sanitizeResponse),
  }

  res.send(responseData)
}
