import clerkClient, { RequireAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import fs from 'fs'
import createError from 'http-errors'
import { ObjectId } from 'mongodb'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Collections } from '../../db/collections.js'
import { db } from '../../db/mongo.js'
import { Post } from '../../db/types/posts.js'

export const deletePost = async (
  req: RequireAuthProp<Request<{ postId: string }>>,
  res: Response,
) => {
  const { postId } = req.params
  const user = await clerkClient.users.getUser(req.auth?.userId)

  const post = await db.collection<Post>(Collections.Posts).findOne({
    _id: new ObjectId(postId),
    'author.userId': user.id,
  })

  const response = await db.collection<Post>(Collections.Posts).deleteOne({
    _id: new ObjectId(postId),
    'author.userId': user.id,
  })

  if (post?.imageUrl) {
    const pathToImage = path.join(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      'public',
      post.imageUrl,
    )

    fs.unlink(pathToImage, (err) => {
      if (err) {
        console.error(err)
      }
    })
  }

  if (response.deletedCount === 0) {
    res.status(404).send(createError(404, 'post not found'))
  }

  res.send(response)
}
