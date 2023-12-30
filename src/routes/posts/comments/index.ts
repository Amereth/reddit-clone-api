import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { Router } from 'express'
import { createComment } from './createComment.js'

export const commentsRouter = Router({ mergeParams: true })

commentsRouter.post('/', ClerkExpressRequireAuth(), createComment)
