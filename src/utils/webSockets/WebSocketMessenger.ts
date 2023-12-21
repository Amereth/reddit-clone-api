import { WebSocket } from 'ws'
import { z } from 'zod'
import { chatMessage, ChatMessage } from '../../db/types/chat.js'

export const outgoingMessage = z.union([
  z.object({
    type: z.literal('message'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('error'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('history'),
    content: z.array(chatMessage),
  }),
])

export type OutgoingMessage = z.infer<typeof outgoingMessage>

export class WebSocketMessenger {
  _socket: WebSocket

  constructor(socket: WebSocket) {
    this._socket = socket
  }

  validateMessage = (message: OutgoingMessage) => {
    const result = outgoingMessage.safeParse(message)

    if (result.success) return this

    this.sendError(result.error.message)
    return this
  }

  send = (message: OutgoingMessage) => {
    this._socket.send(JSON.stringify(message))
  }

  sendError(content: string) {
    const outgoingMessage = { type: 'error', content } as const
    if (this.validateMessage(outgoingMessage)) this.send(outgoingMessage)
  }

  sendMessage(content: string) {
    const outgoingMessage = { type: 'message', content } as const
    if (this.validateMessage(outgoingMessage)) this.send(outgoingMessage)
  }

  sendHistory(content: ChatMessage[]) {
    const outgoingMessage = { type: 'history', content } as const
    if (this.validateMessage(outgoingMessage)) this.send(outgoingMessage)
  }
}
