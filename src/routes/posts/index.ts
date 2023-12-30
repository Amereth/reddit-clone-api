import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
} from '@clerk/clerk-sdk-node'
import { Router } from 'express'
import { uploads } from '../../utils/multer.js'
import { commentsRouter } from './comments/index.js'
import { createPost } from './createPost.js'
import { deletePost } from './deletePost.js'
import { getPost } from './getPost.js'
import { getPosts } from './getPosts.js'
import { dislikePost, likePost } from './likeDislikePost.js'
import { patchPost } from './patchPost.js'

export const postsRouter = Router()

postsRouter.use('/:postId/comment', commentsRouter)

postsRouter.post(
  '/',
  ClerkExpressRequireAuth(),
  uploads.single('image'),
  createPost,
)

postsRouter.get('/', ClerkExpressWithAuth(), getPosts)
postsRouter.get('/:postId', ClerkExpressWithAuth(), getPost)
postsRouter.patch('/:postId', ClerkExpressRequireAuth(), patchPost)
postsRouter.put('/:postId/like', ClerkExpressRequireAuth(), likePost)
postsRouter.put('/:postId/dislike', ClerkExpressRequireAuth(), dislikePost)
postsRouter.delete('/:postId', ClerkExpressRequireAuth(), deletePost)
