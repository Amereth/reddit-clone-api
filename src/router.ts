import { Router } from 'express'
import { postsRouter } from './routes/posts/index.js'

export const router = Router()

router.use('/posts', postsRouter)
