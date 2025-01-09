import { HttpError } from 'wasp/server'
import type { User, ChatMessage, Channel, WorkspaceUser, Workspace } from 'wasp/entities'

// Define our own context type, since wasp/server doesn't export QueryArgs or ActionArgs
type WaspContext = {
  user?: User
  entities: {
    User: any
    Workspace: any
    WorkspaceUser: any
    Channel: any
    ChatMessage: any
  }
}

/**
 * getChatMessages
 */
export async function getChatMessages(
    { channelId }: { channelId: number },
    context: WaspContext
  ): Promise<(ChatMessage & { user: User })[]> {
    if (!context.user) {
      throw new HttpError(401, 'User not found')
    }
  
    if (!channelId) {
      throw new HttpError(400, 'No channelId provided')
    }
  
    return context.entities.ChatMessage.findMany({
      where: { channelId },
      include: { user: true },
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

  // Optional membership checks could go here if needed
  return context.entities.ChatMessage.create({
    data: {
      content,
      userId: context.user.id,
      channelId,
    },
  })
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

  return context.entities.Channel.create({
    data: {
      name,
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
): Promise<(ChatMessage & { user: User })[]> {
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

  // Return the messages in this thread
  return context.entities.ChatMessage.findMany({
    where: { channelId: threadChannelId },
    include: { user: true },
    orderBy: { id: 'asc' },
  })
}
