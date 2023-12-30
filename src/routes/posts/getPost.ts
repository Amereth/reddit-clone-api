import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { Post } from '../../db/types/posts.js'
import { sanitizeResponse } from '../../utils/sanitizeResponse.js'

type Params = {
  postId: string
}

export const getPost = async (
  req: WithAuthProp<Request<Params>>,
  res: Response,
) => {
  const data = await db
    .collection<Post>(Collections.Posts)
    .find({ _id: new ObjectId(req.params.postId) })
    .limit(1)
    .toArray()

  const posts = data.map((post) => ({
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

  const returnedPost = posts[0]

  if (!returnedPost) res.status(404).send({ message: 'Post not found' })

  res.send(returnedPost && sanitizeResponse(returnedPost))
}
