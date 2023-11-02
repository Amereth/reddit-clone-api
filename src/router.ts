import { Router } from 'express'
import { postsRouter } from './routes/posts.js'

export const router = Router()

router.use(postsRouter)
