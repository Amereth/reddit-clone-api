import { StrictAuthProp } from '@clerk/clerk-sdk-node'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import helmet from 'helmet'
import createError from 'http-errors'
import morgan from 'morgan'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { connectToMongo } from './db/mongo.js'
import { router } from './router.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))

app.use(
  express.static(path.join(dirname(fileURLToPath(import.meta.url)), 'public')),
)
app.use(helmet())

app.use(bodyParser.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(router)

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.log('ERROR', error)

  if (error instanceof Error && error.message === 'Unauthenticated') {
    res.status(401).send(createError(401, 'Unauthenticated'))
  }

  if (error instanceof Error) {
    res.status(500).send(createError(500, error.message))
  }

  res.status(500).send('Unknown error')
})

app.listen(8080, () => {
  console.log('Example app listening on port 8080')
  connectToMongo()
})
