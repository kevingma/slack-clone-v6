import type { ChatMessage, User, Channel } from 'wasp/entities'
import type {
  GetChatMessages,
  CreateChatMessage,
  GetChannels,
  CreateChannel,
  DeleteChannel
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'
import type { UpdateDisplayName } from 'wasp/server/operations'


type ChatMessageWithUser = ChatMessage & { user: User }

// Return all messages in a specific channel, newest last
// We'll assume 'general' channel if channelId isn't passed.
type GetChatMessagesArgs = {
  channelId?: number
}
export const getChatMessages: GetChatMessages<GetChatMessagesArgs, ChatMessageWithUser[]> = async ({ channelId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // If no channelId provided, find or create a #general channel
  let channel = null
  if (!channelId) {
    channel = await context.entities.Channel.findFirst({ where: { name: '#general' } })
    if (!channel) {
      channel = await context.entities.Channel.create({
        data: {
          name: '#general'
        }
      })
    }
  } else {
    channel = await context.entities.Channel.findUnique({ where: { id: channelId } })
    if (!channel) {
      throw new HttpError(404, 'Channel not found')
    }
  }

  return context.entities.ChatMessage.findMany({
    where: { channelId: channel.id },
    include: { user: true },
    orderBy: { id: 'asc' }
  })
}

type CreateChatMessageInput = {
  content: string
  channelId?: number
}

// Create a new message in a specific channel
export const createChatMessage: CreateChatMessage<CreateChatMessageInput, ChatMessage> = async (
  { content, channelId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // If no channelId is provided, assume #general.
  let channel = null
  if (!channelId) {
    channel = await context.entities.Channel.findFirst({ where: { name: '#general' } })
    if (!channel) {
      channel = await context.entities.Channel.create({
        data: {
          name: '#general'
        }
      })
    }
  } else {
    channel = await context.entities.Channel.findUnique({ where: { id: channelId } })
    if (!channel) {
      throw new HttpError(404, 'Channel not found')
    }
  }

  return context.entities.ChatMessage.create({
    data: {
      content,
      userId: context.user.id,
      channelId: channel.id
    }
  })
}

// =============== Channel operations ===============

// Get all channels
export const getChannels: GetChannels<void, Channel[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }
  return context.entities.Channel.findMany({
    orderBy: { name: 'asc' }
  })
}

// Create a new channel
type CreateChannelInput = {
  name: string
}
export const createChannel: CreateChannel<CreateChannelInput, Channel> = async ({ name }, context) => {
    if (!context.user) {
      throw new HttpError(401, 'User not found')
    }
  
    // Prepend '#' to the channel name if not already present
    const channelName = name.startsWith('#') ? name : `#${name}`
  
    const existingChannel = await context.entities.Channel.findFirst({
      where: { name: channelName }
    })
    if (existingChannel) {
      throw new HttpError(400, 'Channel already exists')
    }
  
    return context.entities.Channel.create({
      data: {
        name: channelName
      }
    })
  }

// Delete a channel
type DeleteChannelInput = {
  channelId: number
}
export const deleteChannel: DeleteChannel<DeleteChannelInput, Channel> = async ({ channelId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // For safety, disallow deleting #general channel
  const channel = await context.entities.Channel.findUnique({ where: { id: channelId } })
  if (!channel) {
    throw new HttpError(404, 'Channel not found')
  }
  if (channel.name === '#general') {
    throw new HttpError(400, "Cannot delete the #general channel.")
  }

  // Delete messages first or rely on cascade if set in DB
  // Prisma requires onDelete: CASCADE at the DB level or manual deletion
  await context.entities.ChatMessage.deleteMany({ where: { channelId } })

  return context.entities.Channel.delete({
    where: { id: channelId }
  })
}

type UpdateDisplayNameInput = {
    displayName: string
  }
  
  export const updateDisplayName: UpdateDisplayName<UpdateDisplayNameInput, User> = async (
    { displayName },
    context
  ) => {
    if (!context.user) {
      throw new HttpError(401, 'User not found')
    }
  
    return context.entities.User.update({
      where: { id: context.user.id },
      data: { displayName }
    })
  }
  