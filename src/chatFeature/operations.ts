import type { ChatMessage, User, Channel, Workspace } from 'wasp/entities'
import type {
  GetChatMessages,
  CreateChatMessage,
  GetChannels,
  CreateChannel,
  DeleteChannel
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

type GetChatMessagesArgs = {
  channelId?: number
  // no workspaceId needed here unless we want to ensure the message is in the workspace
}

// Return all messages in a specific channel, newest last
export const getChatMessages: GetChatMessages<GetChatMessagesArgs, (ChatMessage & { user: User })[]> = async (
  { channelId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // same logic as before
  if (!channelId) {
    // find or create #general in a default workspace, for example
    // or throw an error if channelId is required
    throw new HttpError(400, 'channelId is required')
  }

  const channel = await context.entities.Channel.findUnique({ where: { id: channelId } })
  if (!channel) {
    throw new HttpError(404, 'Channel not found')
  }

  return context.entities.ChatMessage.findMany({
    where: { channelId },
    include: { user: true },
    orderBy: { id: 'asc' }
  })
}

// Create a new message in a specific channel
type CreateChatMessageInput = {
  content: string
  channelId: number
}
export const createChatMessage: CreateChatMessage<CreateChatMessageInput, ChatMessage> = async (
  { content, channelId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  const channel = await context.entities.Channel.findUnique({ where: { id: channelId } })
  if (!channel) {
    throw new HttpError(404, 'Channel not found')
  }

  return context.entities.ChatMessage.create({
    data: {
      content,
      userId: context.user.id,
      channelId
    }
  })
}

// =============== Channel operations ===============
type GetChannelsArgs = {
  workspaceId: number
}

// Get all channels for a given workspace
export const getChannels: GetChannels<GetChannelsArgs, Channel[]> = async ({ workspaceId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  return context.entities.Channel.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' }
  })
}

// Create a new channel in a specific workspace
type CreateChannelInput = {
  name: string
  workspaceId: number
}
export const createChannel: CreateChannel<CreateChannelInput, Channel> = async ({ name, workspaceId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  const channelName = name.startsWith('#') ? name : `#${name}`

  // check if user is in that workspace
  const membership = await context.entities.WorkspaceUser.findFirst({
    where: {
      userId: context.user.id,
      workspaceId
    }
  })
  if (!membership) {
    throw new HttpError(403, 'You are not a member of this workspace.')
  }

  const existingChannel = await context.entities.Channel.findFirst({
    where: {
      name: channelName,
      workspaceId
    }
  })
  if (existingChannel) {
    throw new HttpError(400, 'Channel already exists in this workspace')
  }

  return context.entities.Channel.create({
    data: {
      name: channelName,
      workspaceId
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

  const channel = await context.entities.Channel.findUnique({ where: { id: channelId } })
  if (!channel) {
    throw new HttpError(404, 'Channel not found')
  }

  if (channel.name === '#general') {
    throw new HttpError(400, 'Cannot delete the #general channel.')
  }

  // check membership
  const membership = await context.entities.WorkspaceUser.findFirst({
    where: {
      userId: context.user.id,
      workspaceId: channel.workspaceId
    }
  })
  if (!membership) {
    throw new HttpError(403, 'You are not a member of this workspace.')
  }

  // Delete messages first or rely on cascade if set in DB
  await context.entities.ChatMessage.deleteMany({ where: { channelId } })
  return context.entities.Channel.delete({ where: { id: channelId } })
}
