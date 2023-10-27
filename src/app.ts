import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import { connectToMongo, db } from './db/mongo.js'
import helmet from 'helmet'
import 'express-async-errors'
import cors from 'cors'
import {
  ClerkExpressRequireAuth,
  RequireAuthProp,
  LooseAuthProp,
} from '@clerk/clerk-sdk-node'

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:3000' }))

// Declare a route
app.get('/', async (request, response) => {
  console.log('app.get ~ request:', request)

  const data = await db.collection('posts').find().toArray()
  console.log('data:', data)
  response.send(data)
})

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log('ERROR', error)
  res.status(500).send('Something broke!')
})

app.listen(8080, () => {
  console.log('Example app listening on port 8080')
  connectToMongo()
})
