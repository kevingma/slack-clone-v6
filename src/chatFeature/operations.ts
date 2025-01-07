import type { ChatMessage } from 'wasp/entities'
import type {
  GetChatMessages,
  CreateChatMessage
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

// Return all messages, newest last
export const getChatMessages: GetChatMessages<void, ChatMessage[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }
  // Return all chat messages from all users
  return context.entities.ChatMessage.findMany({
    orderBy: { id: 'asc' }
  })
}

type CreateChatMessageInput = {
  content: string
}

export const createChatMessage: CreateChatMessage<CreateChatMessageInput, ChatMessage> = async (
  { content },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // Create a new chat message
  return context.entities.ChatMessage.create({
    data: {
      content,
      userId: context.user.id
    }
  })
}