import type { Channel, ChannelParticipant, User } from 'wasp/entities'
import type { GetDmChannels, CreateDmChannel } from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

type GetDmChannelsArgs = Record<string, never>

export const getDmChannels: GetDmChannels<GetDmChannelsArgs, (Channel & { participants: ChannelParticipant[] })[]> =
  async (_args, context) => {
    if (!context.user) {
      throw new HttpError(401, 'User not found')
    }

    return context.entities.Channel.findMany({
      where: {
        isDm: true,
        participants: {
          some: { userId: context.user.id },
        }
      },
      include: { participants: true },
      orderBy: { id: 'asc' }
    })
  }

type CreateDmChannelInput = {
  otherUserEmail: string
}

export const createDmChannel: CreateDmChannel<CreateDmChannelInput, Channel> = async (
    { otherUserEmail },
    context
  ) => {
    if (!context.user) {
      throw new HttpError(401, 'User not found')
    }
  
    if (!otherUserEmail?.trim()) {
      throw new HttpError(400, 'No otherUserEmail provided')
    }
  
    const otherUser = await context.entities.User.findUnique({
      where: { email: otherUserEmail }
    })
    if (!otherUser) {
      throw new HttpError(404, 'User with that email not found')
    }
    if (otherUser.id === context.user.id) {
      throw new HttpError(400, 'Cannot create DM with yourself')
    }
  
    const existing = await context.entities.Channel.findFirst({
      where: {
        isDm: true,
        participants: {
          some: { userId: context.user.id }
        },
        AND: [
          { participants: { some: { userId: otherUser.id } } }
        ]
      }
    })
    if (existing) {
      return existing
    }
  
    const dmName = `DM: ${context.user.email} & ${otherUser.email}`
    const newChannel = await context.entities.Channel.create({
      data: {
        name: dmName,
        isDm: true
      }
    })
  
    await context.entities.ChannelParticipant.createMany({
      data: [
        { channelId: newChannel.id, userId: Number(context.user.id) },
        { channelId: newChannel.id, userId: Number(otherUser.id) }
      ]
    })
  
    return newChannel
  }