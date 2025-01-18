import { HttpError } from 'wasp/server'
import {
  createPersonaString,
  createAiResponse,
  generateAIReply
} from './aiService'
import type { User } from 'wasp/entities'

/**
 * Example usage of the aiService exports, if needed here.
 * If you don't actually use them in aiFeature/operations,
 * you can remove these calls entirely.
 */

export async function exampleAiUsage(
  user: User,
  content: string,
  channelHistory: string
): Promise<string> {
  if (!user.persona) {
    throw new HttpError(400, 'User has no persona defined.')
  }
  const personaStr = createPersonaString(user.displayName, user.persona, channelHistory)
  const response = await createAiResponse(personaStr, content)
  // OR do a single call:
  // const response = await generateAIReply(user.persona, channelHistory, user.displayName, content)
  return response
}