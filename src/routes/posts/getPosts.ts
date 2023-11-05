import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { sanitizeResponse } from '../../utils/sanitizeResponse.js'
import { Post } from './index.js'

export const getPosts = async (req: WithAuthProp<Request>, res: Response) => {
  const data = await db.collection<Post>(Collections.Posts).find().toArray()

  res.send(sanitizeResponse(data))
}
