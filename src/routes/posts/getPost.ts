import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import createHttpError from 'http-errors'
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

  const post = data[0]

  if (!post) res.status(404).send(createHttpError(404, 'post not found'))

  res.send(post && sanitizeResponse(post))
}
