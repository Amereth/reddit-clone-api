import { Router } from 'express'
import { postsRouter } from './posts/index.js'

export const router = Router()

router.use('/posts', postsRouter)
