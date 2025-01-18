import { HttpError } from 'wasp/server'
import type { User, ChatMessage } from 'wasp/entities'
import { createPersonaString, createAiResponse } from './aiService'

// Example Wasp context type:
type WaspContext = {
  user?: User
  entities: {
    User: any
    ChatMessage: any
  }
}

/**
 * generatePersona
 * Action to create (and store) a persona string for the specified user if it doesn't exist yet.
 * Pulls their past ChatMessage records and calls OpenAI to generate a style/persona.
 */
export async function generatePersona (
  { userId }: { userId: number },
  context: WaspContext
): Promise<User> {
  if (!context.user) {
    throw new HttpError(401, 'Must be authenticated.')
  }

  const targetUser = await context.entities.User.findUnique({ where: { id: userId } })
  if (!targetUser) {
    throw new HttpError(404, 'User not found.')
  }

  if (targetUser.persona) {
    // Already has a persona
    return targetUser
  }

  // Gather user's previous chat messages
  const userChats = await context.entities.ChatMessage.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'asc' }
  }) as ChatMessage[]

  const personaString = await createPersonaString(userChats)

  // Save it to the user's record
  const updatedUser = await context.entities.User.update({
    where: { id: userId },
    data: { persona: personaString }
  })

  return updatedUser
}

/**
 * generateAiResponse
 * If the user already has a persona, we feed it plus the new prompt to OpenAI
 * and create a new ChatMessage with the result.
 */
export async function generateAiResponse (
  { userId, prompt, channelId }: { userId: number, prompt: string, channelId: number },
  context: WaspContext
): Promise<ChatMessage> {
  if (!context.user) {
    throw new HttpError(401, 'Must be authenticated.')
  }

  const targetUser = await context.entities.User.findUnique({ where: { id: userId } })
  if (!targetUser || !targetUser.persona) {
    throw new HttpError(400, 'No persona set for this user. Please run generatePersona first.')
  }

  const aiContent = await createAiResponse(targetUser.persona, prompt)

  // Store the AI's answer as a ChatMessage in the given channel
  const newMessage = await context.entities.ChatMessage.create({
    data: {
      content: aiContent,
      userId,
      channelId
    }
  })

  return newMessage
}
