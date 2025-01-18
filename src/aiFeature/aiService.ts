import OpenAI from 'openai'
import type { ChatMessage } from 'wasp/entities'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * createPersonaString
 */
export async function createPersonaString (userChats: ChatMessage[]): Promise<string> {
  const userContent = userChats.map(msg => msg.content).join('\n')

  const systemPrompt = `
    The following are chat messages from a single user.
    Read them carefully and infer that user's style, personality, and manner of speaking.
    Return a short string describing how to speak as this user.
  `
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    max_tokens: 150
  })

  return completion.choices?.[0]?.message?.content?.trim() || ''
}

/**
 * createAiResponse
 */
export async function createAiResponse (persona: string, prompt: string): Promise<string> {
  const systemPrompt = `
    You are impersonating the user with this style/persona:
    "${persona}"
    Respond to the following prompt in that style.
  `
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300
  })

  return completion.choices?.[0]?.message?.content?.trim() || ''
}

export async function generateAIReply(userDisplayName: string, originalMessage: string): Promise<string> {
    // For now, just return a placeholder response.
    // In a real scenario, you'd call OpenAI or other LLM here and pass it `originalMessage`.
    return `Hello @${userDisplayName}, I received your message: "${originalMessage}". This is an AI-generated response.`
  }