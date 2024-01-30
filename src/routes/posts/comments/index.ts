import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { Router } from 'express'
import { createComment } from './createComment.js'
import { patchComment } from './patchComment.js'

export const commentsRouter = Router({ mergeParams: true })

commentsRouter.post('/', ClerkExpressRequireAuth(), createComment)
commentsRouter.patch('/:commentId', ClerkExpressRequireAuth(), patchComment)
