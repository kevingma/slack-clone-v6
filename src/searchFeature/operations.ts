import { HttpError } from 'wasp/server'
import type { SearchMessages } from 'wasp/server/operations'
import type {
  ChatMessage,
  User,
  Channel,
  Attachment,
  Reaction,
  WorkspaceUser,
  Workspace,
  ChannelParticipant
} from 'wasp/entities'

/**
 * This query searches messages that the user has access to (within any channel 
 * they are a member of, either via workspace membership or DM participation).
 */
type SearchMessagesArgs = { query: string }

export const searchMessages: SearchMessages<
  SearchMessagesArgs,
  (ChatMessage & {
    user: User
    channel: Channel
    attachments: Attachment[]
  })[]
> = async ({ query }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  if (!query.trim()) {
    return []
  }

  // Return messages from channels the user can access
  // 1) For DM channels, user must be in ChannelParticipant
  // 2) For workspace channels, user must be a WorkspaceUser in that workspace

  // We'll find all messages that match the "content" with 'contains' match, ignoring case
  return context.entities.ChatMessage.findMany({
    where: {
      content: {
        contains: query,
        mode: 'insensitive'
      },
      channel: {
        OR: [
          // DM channels => check participants
          {
            isDm: true,
            participants: {
              some: {
                userId: context.user.id
              }
            }
          },
          // Workspace channels => check workspace membership
          {
            isDm: false,
            workspace: {
              users: {
                some: {
                  userId: context.user.id
                }
              }
            }
          }
        ]
      }
    },
    include: {
      user: true,
      channel: true,
      attachments: true
    },
    orderBy: { id: 'desc' } // newest first
  })
}
