import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
} from '@clerk/clerk-sdk-node'
import { Router } from 'express'
import { uploads } from '../../utils/multer.js'
import { createPost } from './createPost.js'
import { getPost } from './getPost.js'
import { getPosts } from './getPosts.js'
import { dislikePost, likePost } from './likeDislikePost.js'
import { patchPost } from './patchPost.js'

export const postsRouter = Router()

postsRouter.get('/', ClerkExpressWithAuth(), getPosts)
postsRouter.post(
  '/',
  ClerkExpressRequireAuth(),
  uploads.single('image'),
  createPost,
)
postsRouter.get('/:postId', ClerkExpressWithAuth(), getPost)
postsRouter.patch('/:postId', ClerkExpressRequireAuth(), patchPost)
postsRouter.put('/:postId/like', ClerkExpressRequireAuth(), likePost)
postsRouter.put('/:postId/dislike', ClerkExpressRequireAuth(), dislikePost)
