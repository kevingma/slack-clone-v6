import { HttpError } from 'wasp/server'
import type { Attachment } from 'wasp/entities'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { generateAIReply, generateUserPersona } from '../aiFeature/aiService'
import type {
  User,
  ChatMessage,
  Channel,
  WorkspaceUser,
  Workspace,
  Reaction
} from 'wasp/entities'

type WaspContext = {
  user?: User
  entities: {
    User: any
    Workspace: any
    WorkspaceUser: any
    Channel: any
    ChatMessage: any
    Reaction: any
  }
}

/**
 * getChatMessages
 */
export async function getChatMessages(
  { channelId }: { channelId: number },
  context: WaspContext
): Promise<
  (ChatMessage & {
    user: User
    reactions: (Reaction & { user: User })[]
    attachments: Attachment[]            // <-- Add type info for attachments
  })[]
> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  if (!channelId) {
    throw new HttpError(400, 'No channelId provided')
  }

  return context.entities.ChatMessage.findMany({
    where: { channelId },
    include: {
      user: true,
      reactions: {
        include: { user: true },
      },
      attachments: true,                // <-- Added to fetch attachments
    },
    orderBy: { id: 'asc' },
  })
}

/**
 * createChatMessage
 */
export async function createChatMessage(
  { content, channelId }: { content: string; channelId: number },
  context: WaspContext
): Promise<ChatMessage> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  if (!content.trim() || !channelId) {
    throw new HttpError(400, 'Missing content or channelId')
  }

  // 1. Create the user's new chat message.
  const newMessage = await context.entities.ChatMessage.create({
    data: {
      content,
      userId: context.user.id,
      channelId
    }
  })

  // 2. Look for "@<DISPLAY_NAME>" mentions in the content.
  const mentionRegex = /@([\w\d]+)/g
  const matches = content.matchAll(mentionRegex)

  // 3. Build a single string containing the entire chat history (for the channel).
  const chatMessages = await context.entities.ChatMessage.findMany({
    where: { channelId },
    include: { user: true },
    orderBy: { id: 'asc' }
  })
  const entireChatHistory = chatMessages
    .map((m: ChatMessage & { user: User }) => {
      const name = m.user.displayName || m.user.username || m.user.email
      return `${name}: ${m.content}`
    })
    .join('\n')

  // 4. For each mention, generate an AI reply as that user if they have (or can create) a persona.
  for (const match of matches) {
    const mentionedDisplayName = match[1]
    if (!mentionedDisplayName) continue

    // Find the mentioned user by displayName.
    let mentionedUser = await context.entities.User.findFirst({
      where: { displayName: mentionedDisplayName }
    })

    if (mentionedUser) {
      // If persona is missing, generate it from the user’s entire chat history.
      if (!mentionedUser.persona) {
        // Gather all messages from this user across all channels (or you can limit to certain scope).
        const userMessages = await context.entities.ChatMessage.findMany({
          where: { userId: mentionedUser.id },
          orderBy: { id: 'asc' }
        })
        const userHistory = userMessages.map((msg: ChatMessage) => msg.content).join('\n')

        // Generate persona and store it.
        const generatedPersona = await generateUserPersona(userHistory)
        mentionedUser = await context.entities.User.update({
          where: { id: mentionedUser.id },
          data: { persona: generatedPersona }
        })
      }

      // Only generate an AI reply if the user now has a persona.
      if (mentionedUser.persona) {
        const aiResponse = await generateAIReply(
          mentionedUser.persona,
          entireChatHistory,   // 2nd argument (chat history in the channel)
          mentionedDisplayName,
          content
        )

        // Create the AI's response message (bot userId=1).
        await context.entities.ChatMessage.create({
          data: {
            content: aiResponse,
            userId: 1, // system/bot user
            channelId
          }
        })
      }
    }
  }

  return newMessage
}

/**
 * getChannels
 */
export async function getChannels(
  { workspaceId }: { workspaceId: number },
  context: WaspContext
): Promise<Channel[]> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  if (!workspaceId) {
    throw new HttpError(400, 'No workspaceId provided')
  }

  // Check membership in the target workspace
  const membership = await context.entities.WorkspaceUser.findFirst({
    where: { userId: context.user.id, workspaceId },
  })
  if (!membership) {
    throw new HttpError(403, 'Not a member of this workspace.')
  }

  // Return channels
  return context.entities.Channel.findMany({
    where: { workspaceId, isThread: false },
    orderBy: { id: 'asc' },
  })
}

/**
 * createChannel
 */
export async function createChannel(
  { name, workspaceId }: { name: string; workspaceId: number },
  context: WaspContext
): Promise<Channel> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // Check membership
  const membership = await context.entities.WorkspaceUser.findFirst({
    where: { userId: context.user.id, workspaceId },
  })
  if (!membership) {
    throw new HttpError(403, 'Not a member of this workspace.')
  }

  // Prepend '#' if it doesn't already start with it
  const channelName = name.startsWith('#') ? name : `#${name}`

  return context.entities.Channel.create({
    data: {
      name: channelName,
      workspaceId,
      isThread: false,
    },
  })
}

/**
 * deleteChannel
 */
export async function deleteChannel(
  { channelId }: { channelId: number },
  context: WaspContext
): Promise<Channel> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // Check if channel exists
  const channel = await context.entities.Channel.findUnique({
    where: { id: channelId },
  })
  if (!channel) {
    throw new HttpError(404, 'Channel not found.')
  }

  // You could add additional checks such as only owner can delete, etc.

  // Delete messages tied to this channel
  await context.entities.ChatMessage.deleteMany({
    where: { channelId },
  })

  // Delete the channel
  return context.entities.Channel.delete({
    where: { id: channelId },
  })
}

/**
 * createThreadChannel
 */
export async function createThreadChannel(
  { parentMessageId, workspaceId }: { parentMessageId: number; workspaceId: number },
  context: WaspContext
): Promise<Channel> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // Check user membership in the target workspace
  const membership = await context.entities.WorkspaceUser.findFirst({
    where: { userId: context.user.id, workspaceId },
  })
  if (!membership) {
    throw new HttpError(403, 'Not a member of this workspace.')
  }

  // Ensure parent message exists
  const parentMessage = await context.entities.ChatMessage.findUnique({
    where: { id: parentMessageId },
  })
  if (!parentMessage) {
    throw new HttpError(404, 'Parent message not found.')
  }

  // Create the new thread channel
  return context.entities.Channel.create({
    data: {
      name: `Thread on msg #${parentMessageId}`,
      workspaceId,
      isThread: true,
      parentMessageId,
    },
  })
}

/**
 * getThreadChannel
 */
export async function getThreadChannel(
  { threadChannelId }: { threadChannelId: number },
  context: WaspContext
): Promise<(ChatMessage & { user: User, attachments: Attachment[] })[]> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // Make sure this channel is a valid thread
  const threadChannel = await context.entities.Channel.findUnique({
    where: { id: threadChannelId },
  })
  if (!threadChannel || !threadChannel.isThread) {
    throw new HttpError(404, 'Thread channel not found or not a thread.')
  }

  // Check membership if this thread is linked to a workspace
  if (threadChannel.workspaceId) {
    const membership = await context.entities.WorkspaceUser.findFirst({
      where: {
        userId: context.user.id,
        workspaceId: threadChannel.workspaceId,
      },
    })
    if (!membership) {
      throw new HttpError(403, 'You are not a member of this workspace.')
    }
  }

  // Return the messages in this thread, including attachments
  return context.entities.ChatMessage.findMany({
    where: { channelId: threadChannelId },
    include: {
      user: true,
      attachments: true, // <-- ADDED THIS
    },
    orderBy: { id: 'asc' },
  })
}

/**
 * addReaction
 */
export async function addReaction(
  { messageId, emoji }: { messageId: number; emoji: string },
  context: WaspContext
): Promise<Reaction> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }
  if (!emoji.trim() || !messageId) {
    throw new HttpError(400, 'Missing emoji or messageId')
  }

  // Ensure the message exists
  const message = await context.entities.ChatMessage.findUnique({
    where: { id: messageId },
  })
  if (!message) {
    throw new HttpError(404, 'Message not found.')
  }

  // Upsert the reaction so duplicate reacts won't create duplicates
  return context.entities.Reaction.upsert({
    where: {
      uniqueReaction: {
        userId: context.user.id,
        messageId,
        emoji,
      },
    },
    create: {
      emoji,
      userId: context.user.id,
      messageId,
    },
    update: {},
  })
}


/**
 * removeReaction
 */
export async function removeReaction(
  { messageId, emoji }: { messageId: number; emoji: string },
  context: WaspContext
): Promise<Reaction> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }
  if (!emoji.trim() || !messageId) {
    throw new HttpError(400, 'Missing emoji or messageId')
  }

  const deletedReaction = await context.entities.Reaction.delete({
    where: {
      uniqueReaction: {
        userId: context.user.id,
        messageId,
        emoji,
      },
    },
  })
  if (!deletedReaction) {
    throw new HttpError(404, 'Reaction not found.')
  }

  return deletedReaction
}

type UploadAttachmentArgs = {
  fileName: string
  fileContent: string  // base64-encoded file content
  messageId?: number   // if attaching to an existing message
}

const s3 = new S3Client({ region: process.env.AWS_S3_REGION })

export async function uploadAttachment(
  args: UploadAttachmentArgs,
  context: { user?: User, entities: any }
): Promise<Attachment> {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }
  if (!args.fileContent || !args.fileName) {
    throw new HttpError(400, 'Missing fileName or fileContent')
  }

  // Decode base64 file content
  const buffer = Buffer.from(args.fileContent, 'base64')

  const uniqueKey = `${uuidv4()}-${args.fileName}`
  const bucketName = process.env.AWS_S3_BUCKET as string
  if (!bucketName) {
    throw new HttpError(500, 'S3 bucket name not configured')
  }

  // Upload to S3 with public-read ACL
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    Body: buffer,
    ACL: 'public-read' // <-- Add this to allow public access
  })
  await s3.send(command)

  // Construct a public URL if your bucket is set to public
  const s3Url = `https://${bucketName}.s3.amazonaws.com/${uniqueKey}`

  // Create Attachment record
  const attachment = await context.entities.Attachment.create({
    data: {
      url: s3Url,
      filename: args.fileName,
      messageId: args.messageId || null,
      userId: context.user.id
    }
  })

  return attachment
}
