import { WebSocket, WebSocketServer } from 'ws'
import { z } from 'zod'
import { chatMessage, ChatMessage } from '../../db/types/chat.js'

export const OutgoingErrorMessage = z.object({
  type: z.literal('error'),
  content: z.string(),
})

export const OutgoingHistoryMessage = z.object({
  type: z.literal('history'),
  content: z.array(chatMessage),
})

export const OutgoingBroadcastMessage = z.object({
  type: z.literal('error'),
  content: z.string(),
})

export const OutgoingSimpleMessage = z.object({
  type: z.literal('message'),
  content: chatMessage,
})

export const outgoingMessage = z.union([
  OutgoingErrorMessage,
  OutgoingHistoryMessage,
  OutgoingBroadcastMessage,
  OutgoingSimpleMessage,
])

export type OutgoingMessage = z.infer<typeof outgoingMessage>

export class WebSocketMessenger {
  _socket: WebSocket
  _wsServer: WebSocketServer

  constructor(socket: WebSocket, wsServer: WebSocketServer) {
    this._socket = socket
    this._wsServer = wsServer
  }

  validateMessage = (message: OutgoingMessage) => {
    const result = outgoingMessage.safeParse(message)

    if (result.success) return this

    this.sendError(result.error.message)
    return this
  }

  send = (message: OutgoingMessage, client?: WebSocket) => {
    const socket = client ?? this._socket
    socket.send(JSON.stringify(message))
  }

  sendError(error: string, client?: WebSocket) {
    const outgoingMessage = { type: 'error', content: error } as const
    if (this.validateMessage(outgoingMessage)) {
      this.send(outgoingMessage, client)
    }
  }

  sendMessage(message: ChatMessage, client?: WebSocket) {
    const outgoingMessage = { type: 'message', content: message } as const
    if (this.validateMessage(outgoingMessage)) {
      this.send(outgoingMessage, client)
    }
  }

  sendHistory(history: ChatMessage[], client?: WebSocket) {
    const outgoingMessage = { type: 'history', content: history } as const
    if (this.validateMessage(outgoingMessage)) {
      this.send(outgoingMessage, client)
    }
  }

  broadcast(message: ChatMessage) {
    const outgoingMessage = { type: 'message', content: message } as const

    this._wsServer.clients.forEach((client) => {
      this.send(outgoingMessage, client)
    })
  }
}
