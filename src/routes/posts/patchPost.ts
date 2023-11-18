import clerkClient, { RequireAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import createError, { HttpError } from 'http-errors'
import { ObjectId } from 'mongodb'
import { pick } from 'rambda'
import { z } from 'zod'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { getZodSchemaKeys } from '../../utils/getZodSchemaKeys.js'
import {
  SanitizedResponse,
  sanitizeResponse,
} from '../../utils/sanitizeResponse.js'
import { Post, post } from './types.js'

const requestBody = post
  .pick({ title: true, body: true, hashtags: true })
  .partial()

type RequestBody = z.infer<typeof requestBody>

type ResponseBody = SanitizedResponse<Post> | HttpError<404>

const params = z.object({
  postId: z.string(),
})

type Params = z.infer<typeof params>

export const patchPost = async (
  req: RequireAuthProp<Request<Params, ResponseBody, RequestBody>>,
  res: Response<ResponseBody>,
) => {
  requestBody.parse(req.body)

  const user = await clerkClient.users.getUser(req.auth?.userId)

  const body = pick(getZodSchemaKeys(requestBody), req.body)

  const updatedAt = new Date()

  const response = await db.collection<Post>(Collections.Posts).updateOne(
    {
      _id: new ObjectId(req.params.postId),
      'author.userId': user.id,
    },
    {
      $set: {
        ...body,
        updatedAt,
      },
    },
  )

  if (response.modifiedCount === 0) {
    res.send(createError(404, 'post not found'))
    return
  }

  const post = await db.collection<Post>(Collections.Posts).findOne({
    _id: new ObjectId(req.params.postId),
  })

  if (!post) {
    res.send(createError(404, 'post not found'))
    return
  }

  res.status(201).send(sanitizeResponse(post))
}
