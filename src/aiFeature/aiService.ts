import OpenAI from 'openai'

/**
 * Create an OpenAI instance with your API key.
 * Make sure you have OPENAI_API_KEY in your env variables.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Builds a persona string from user data and chat history
 * that will guide the AI to respond in that user's style.
 */
export function createPersonaString (
  userDisplayName: string,
  persona: string,
  chatHistory: string
): string {
  return `
You are the user with display name: ${userDisplayName}.
Your detailed persona is: ${persona}

Here is the chat history so far:
${chatHistory}

Respond in the style of ${userDisplayName} based on this persona.
`
}

/**
 * Calls the OpenAI API to get a response based on the persona + user's prompt.
 */
export async function createAiResponse (
  personaString: string,
  mentionContent: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: personaString },
      { role: 'user', content: mentionContent }
    ],
    max_tokens: 300,
    temperature: 0.7
  })

  // Return the AI text response
  return response.choices?.[0]?.message?.content ?? ''
}

/**
 * Generates a full AI reply using a single call,
 * combining persona, chat history, and mention content.
 */
export async function generateAIReply(
    persona: string,
    entireChatHistory: string,
    mentionedDisplayName: string,
    userContent: string
  ): Promise<string> {
    // Implementation example (modify as you wish):
    const prompt = `
  Persona: ${persona}
  ---
  Conversation so far:
  ${entireChatHistory}
  ---
  User @${mentionedDisplayName} just mentioned me saying:
  "${userContent}"
  ---
  Respond in the style of the persona above:
  `
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: persona },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
      })
  
      return response.choices[0]?.message?.content?.trim() || '...'
    } catch (error) {
      console.error('Error from OpenAI:', error)
      return 'Sorry, I had trouble generating a response.'
    }
  }

  /**
 * Generates a persona string for a user from their entire chat history.
 * This function calls OpenAI with a system prompt instructing it to analyze
 * the user's messages and produce a short "persona" style summary.
 */
export async function generateUserPersona(userHistory: string): Promise<string> {
    const systemPrompt = `
      You are analyzing a user's entire chat history to derive a concise "persona" or speaking style.
      The persona should reflect how they talk, any key phrases, personality traits, or interests, 
      based on the following messages. Summarize in 2-3 sentences.
    `
  
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userHistory }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
  
      return completion.choices[0]?.message?.content?.trim() || 'A friendly, helpful user.'
    } catch (err) {
      console.error('Error generating user persona:', err)
      return 'A friendly, helpful user.'
    }
  }
  