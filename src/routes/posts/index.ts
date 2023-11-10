import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
} from '@clerk/clerk-sdk-node'
import { Router } from 'express'
import { createPost } from './createPost.js'
import { getPosts } from './getPosts.js'
import { dislikePost, likePost } from './likeDislikePost.js'

export const postsRouter = Router()

postsRouter.get('/', ClerkExpressWithAuth(), getPosts)
postsRouter.post('/', ClerkExpressRequireAuth(), createPost)
postsRouter.put('/:postId/like', ClerkExpressRequireAuth(), likePost)
postsRouter.put('/:postId/dislike', ClerkExpressRequireAuth(), dislikePost)
