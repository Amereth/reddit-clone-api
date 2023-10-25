import 'dotenv/config'
import express from 'express'
import { connectToMongo, db } from './db/mongo.js'
import helmet from 'helmet'

const app = express()
app.use(helmet())

// Declare a route
app.get('/', async (request, response) => {
  const data = await db.collection('posts').find().toArray()
  console.log('data:', data)
  response.send(data)
})

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`)
  connectToMongo()
})
