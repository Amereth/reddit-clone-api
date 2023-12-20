import { User, clerkClient } from '@clerk/clerk-sdk-node'
import { Server } from 'http'
import { WebSocketServer } from 'ws'
import { z } from 'zod'
import { Collections } from '../db/collections.js'
import { db } from '../db/mongo.js'
import { sanitizeResponse } from '../utils/sanitizeResponse.js'
import { verifyJwt } from '../utils/verifyJwt.js'

export const createWebSocketServer = (expressServer: Server) => {
  const websocketServer = new WebSocketServer({
    noServer: true,
    path: '/chat-room',
  })

  expressServer.on('upgrade', (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request)
    })
  })

  websocketServer.on('connection', (socket) => {
    let user: User

    socket.on('message', async (jsonMessage) => {
      try {
        const message = zMessage.parse(JSON.parse(jsonMessage.toString()))

        if (message.type === 'auth') {
          verifyJwt(message.content, async (error, decoded) => {
            if (error) throw error

            const _user = await clerkClient.users.getUser(
              decoded?.sub as string,
            )

            if (!_user) throw new Error('User not found')
            user = _user

            const messageHistory = await db
              .collection(Collections.ChatMessages)
              .find()
              .toArray()

            const message = {
              type: 'history',
              content: sanitizeResponse(messageHistory),
            }

            socket.send(JSON.stringify(message))
          })

          return
        }

        if (message.type === 'message') {
          console.log('socket.on ~ message:', message)

          if (!user) {
            socket.send(
              JSON.stringify({ type: 'error', content: 'Unauthorized' }),
            )
            socket.close()
            return
          }

          const timestamp = new Date().toISOString()

          const dbMessage = {
            content: message.content,
            createdAt: timestamp,
            updatedAt: null,
            deletedAt: null,
            author: {
              userId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            },
          }

          const dbReponse = await db
            .collection(Collections.ChatMessages)
            .insertOne(dbMessage)
          console.log('socket.on ~ dbReponse:', dbReponse)

          if (!dbReponse.insertedId) {
            socket.send(
              JSON.stringify({ type: 'error', content: 'Message not saved' }),
            )
            return
          }

          const jsonResponse = JSON.stringify({
            id: dbReponse.insertedId,
            type: 'message',
            ...dbMessage,
          })

          websocketServer.clients.forEach((client) => {
            console.log('broadcasting to all clients')
            client.send(jsonResponse)
          })
        }
      } catch (error) {
        let errorMessage
        if (error instanceof Error) {
          errorMessage = error.message
        }
        if (typeof error === 'string') {
          errorMessage = error
        }
        console.error('ERROR', error)
        socket.send(JSON.stringify({ type: 'error', content: errorMessage }))
        socket.close()
      }
    })
  })

  return websocketServer
}

const zMessage = z.object({
  type: z.enum(['auth', 'message', 'error', 'history']),
  content: z.string(),
})

export type Message = z.infer<typeof zMessage>
