import clerkClient, { RequireAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { InsertOneResult } from 'mongodb'
import { pick } from 'rambda'
import { z } from 'zod'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { getZodSchemaKeys } from '../../utils/getZodSchemaKeys.js'
import { sanitizeString } from '../../utils/sanitizeString.js'
import { post, Post } from './types.js'

const requestBody = post.pick({ title: true, body: true, hashtags: true })

type RequestBody = z.infer<typeof requestBody>

type ResponseBody = InsertOneResult<Post>

export const createPost = async (
  req: RequireAuthProp<Request<unknown, ResponseBody, RequestBody>>,
  res: Response<ResponseBody>,
) => {
  console.log('req.body', req.file)
  requestBody.parse(req.body)

  const user = await clerkClient.users.getUser(req.auth?.userId)

  const body = pick(getZodSchemaKeys(requestBody), req.body)

  const createdAt = new Date()

  const imageName =
    req.file?.originalname && sanitizeString(req.file?.originalname)

  const imageUrl = imageName && `/uploads/${imageName}`

  const response = await db.collection<Post>(Collections.Posts).insertOne({
    ...body,
    hashtags: body.hashtags ?? [],
    likes: [],
    dislikes: [],
    imageUrl,
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
