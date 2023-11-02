import { StrictAuthProp } from '@clerk/clerk-sdk-node'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import helmet from 'helmet'
import createError from 'http-errors'
import { connectToMongo } from './db/mongo.js'
import { router } from './router.js'

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(bodyParser.json())
app.use(cookieParser())

app.use(router)

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log('ERROR', error)

  if (error instanceof Error && error.message === 'Unauthenticated') {
    res.send(createError(401, 'Unauthenticated'))
  }

  res.status(500).send(error)
})

app.listen(8080, () => {
  console.log('Example app listening on port 8080')
  connectToMongo()
})
