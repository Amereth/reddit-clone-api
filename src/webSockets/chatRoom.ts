import { User, clerkClient } from '@clerk/clerk-sdk-node'
import { Server } from 'http'
import { WebSocketServer } from 'ws'
import { z } from 'zod'
import { Collections } from '../db/collections.js'
import { db } from '../db/mongo.js'
import { ChatMessage } from '../db/types/chat.js'
import { sanitizeResponse } from '../utils/sanitizeResponse.js'
import { WebSocketMessenger } from '../utils/webSockets/WebSocketMessenger.js'
import { verifyJwt } from '../utils/webSockets/verifyJwt.js'

const incomingMessage = z.object({
  type: z.enum(['auth', 'message']),
  content: z.string(),
})

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

    const messenger = new WebSocketMessenger(socket, websocketServer)

    socket.on('message', async (jsonMessage) => {
      try {
        const message = incomingMessage.parse(
          JSON.parse(jsonMessage.toString()),
        )

        if (message.type === 'auth') {
          verifyJwt(message.content, async (error, decoded) => {
            if (error) throw error

            const _user = await clerkClient.users.getUser(
              decoded?.sub as string,
            )

            if (!_user) throw new Error('user not found')
            user = _user
          })

          const history = await db
            .collection<ChatMessage>(Collections.ChatMessages)
            .find()
            .toArray()

          messenger.sendHistory(sanitizeResponse(history))
          return
        }

        if (message.type === 'message') {
          if (!user) {
            messenger.sendError('unauthorized')
            return
          }

          const dbMessage: ChatMessage = {
            content: message.content,
            createdAt: new Date().toISOString(),
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
            .collection<ChatMessage>(Collections.ChatMessages)
            .insertOne(dbMessage)

          if (!dbReponse.insertedId) {
            messenger.sendError('Message not saved')
            return
          }

          messenger.broadcast(
            sanitizeResponse({
              _id: dbReponse.insertedId,
              ...dbMessage,
            }),
          )
        }
      } catch (error) {
        let errorMessage = 'unknown error'

        if (error instanceof Error) errorMessage = error.message
        if (typeof error === 'string') errorMessage = error

        console.error('ERROR', error)
        messenger.sendError(errorMessage)
      }
    })
  })

  return websocketServer
}
