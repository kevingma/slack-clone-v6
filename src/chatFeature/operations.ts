import type { ChatMessage, User } from 'wasp/entities'
import type {
  GetChatMessages,
  CreateChatMessage
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

type ChatMessageWithUser = ChatMessage & { user: User }

// Return all messages, newest last, including user relation
export const getChatMessages: GetChatMessages<void, ChatMessageWithUser[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }
  // Return all chat messages, including the user relation so msg.user exists
  return context.entities.ChatMessage.findMany({
    include: { user: true },
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