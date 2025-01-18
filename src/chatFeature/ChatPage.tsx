import { FC, useEffect, useState } from 'react'
import { useAuth } from 'wasp/client/auth'
import {
  useQuery,
  getChannels,
  createChannel,
  getWorkspaces,
  createWorkspace,
  getChatMessages,
  createChatMessage,
  addReaction,
  removeReaction
} from 'wasp/client/operations'
import type { Workspace, User, Reaction, ChatMessage } from 'wasp/entities'

type ChatMessageWithReactions = ChatMessage & {
  user: User
  reactions: (Reaction & { user: User })[]
}

export const ChatPage: FC = () => {
  const { data: user } = useAuth()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null)
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>()

  const { data: workspaces = [], refetch: refetchWorkspaces } = useQuery(getWorkspaces)
  const { data: channels = [], refetch: refetchChannels } = useQuery(
    getChannels,
    { workspaceId: selectedWorkspaceId ?? 0 },
    { enabled: !!selectedWorkspaceId }
  )

  // Note the extra type for the input args: { channelId: number }
  const { data: messages = [], refetch: refetchMessages } = useQuery(
    getChatMessages,
    selectedChannelId !== undefined ? { channelId: selectedChannelId } : undefined,
    { enabled: selectedChannelId !== undefined }
  )

  const [content, setContent] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [showNewChannelForm, setShowNewChannelForm] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChannelId) refetchMessages()
    }, 2000)
    return () => clearInterval(interval)
  }, [selectedChannelId, refetchMessages])

  const handleSendMessage = async () => {
    if (!content.trim() || !selectedChannelId) return
    try {
      await createChatMessage({ content, channelId: selectedChannelId })
      setContent('')
      refetchMessages()
    } catch (err: any) {
      window.alert('Error sending message: ' + err.message)
    }
  }

  const handleAddReaction = async (messageId: number, emoji: string) => {
    try {
      await addReaction({ messageId, emoji })
      refetchMessages()
    } catch (err: any) {
      window.alert('Error adding reaction: ' + err.message)
    }
  }

  const handleRemoveReaction = async (messageId: number, emoji: string) => {
    try {
      await removeReaction({ messageId, emoji })
      refetchMessages()
    } catch (err: any) {
      window.alert('Error removing reaction: ' + err.message)
    }
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !selectedWorkspaceId) return
    try {
      await createChannel({ name: newChannelName, workspaceId: selectedWorkspaceId })
      setNewChannelName('')
      setShowNewChannelForm(false)
      refetchChannels()
    } catch (err: any) {
      window.alert('Error creating channel: ' + err.message)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    try {
      await createWorkspace({ name: newWorkspaceName })
      setNewWorkspaceName('')
      setShowNewWorkspaceForm(false)
      refetchWorkspaces()
    } catch (err: any) {
      window.alert('Error creating workspace: ' + err.message)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex'>
      {/* Left sidebar */}
      <div className='w-64 bg-gray-200 flex flex-col p-4 h-full'>
        {/* Workspaces */}
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-bold'>Workspaces</h3>
          <button
            className='bg-blue-500 text-white px-2 py-1 rounded'
            onClick={() => setShowNewWorkspaceForm(!showNewWorkspaceForm)}
          >
            New
          </button>
        </div>
        {showNewWorkspaceForm && (
          <div className='mb-4'>
            <input
              className='border p-1 w-full mb-2'
              placeholder='Workspace name'
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
            <button
              className='bg-green-500 text-white px-2 py-1 rounded w-full'
              onClick={handleCreateWorkspace}
            >
              Create Workspace
            </button>
          </div>
        )}
        <div className='mb-4'>
          <label className='block mb-1 font-semibold'>Select Workspace:</label>
          <select
            className='w-full border p-1'
            value={selectedWorkspaceId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null
              setSelectedWorkspaceId(val)
              setSelectedChannelId(undefined)
            }}
          >
            <option value=''>-- None --</option>
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        {/* Channels */}
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold'>Channels</h3>
          <button
            className='bg-blue-500 text-white px-2 py-1 rounded'
            onClick={() => setShowNewChannelForm(!showNewChannelForm)}
            disabled={!selectedWorkspaceId}
          >
            New Channel
          </button>
        </div>
        {showNewChannelForm && selectedWorkspaceId && (
          <div className='mb-4'>
            <input
              type='text'
              className='border p-1 w-full mb-2'
              placeholder='Channel name'
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <button
              className='bg-green-500 text-white px-2 py-1 rounded w-full'
              onClick={handleCreateChannel}
            >
              Create Channel
            </button>
          </div>
        )}
        <ul className='space-y-2 flex-1 overflow-y-auto'>
          {channels.map(channel => (
            <li
              key={channel.id}
              className={`cursor-pointer p-2 hover:bg-gray-300 ${
                channel.id === selectedChannelId ? 'bg-gray-300 font-semibold' : ''
              }`}
              onClick={() => setSelectedChannelId(channel.id)}
            >
              {channel.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main chat area */}
      <div className='flex-1 flex flex-col border-l border-gray-300 h-full overflow-hidden'>
        <div className='p-4 border-b border-gray-300'>
          <h2 className='text-2xl font-bold'>
            {selectedChannelId
              ? channels.find(ch => ch.id === selectedChannelId)?.name
              : '(No Channel)'} Chat
          </h2>
        </div>

        <div className='flex-1 overflow-y-auto bg-gray-50 p-4'>
          {Array.isArray(messages) && (messages as ChatMessageWithReactions[]).map((msg: ChatMessageWithReactions) => (
            <div key={msg.id} className='mb-4'>
              <div className='flex items-start'>
                <div className='relative group mr-3'>
                  <img
                    src='https://placehold.co/32x32'
                    alt='User Avatar'
                    className='w-8 h-8 rounded-full'
                  />
                </div>
                <div>
                  <div className='text-sm text-gray-700 font-semibold'>
                    {msg.user.displayName || msg.user.username || msg.user.email}
                  </div>
                  <div className='bg-white p-2 border border-gray-200'>
                    {msg.content}
                  </div>
                </div>
              </div>

              {msg.reactions.length > 0 && (
                <div className='ml-11 mt-1 flex gap-2 flex-wrap'>
                  {msg.reactions.map((reaction: Reaction & { user: User }) => (
                    <button
                      key={reaction.id}
                      className='bg-gray-200 px-1 rounded text-sm flex items-center gap-1'
                      onClick={() => handleRemoveReaction(msg.id, reaction.emoji)}
                      title='Click to remove your reaction'
                    >
                      <span>{reaction.emoji}</span>
                      {reaction.userId === user?.id && <span>(You)</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className='ml-11 mt-1'>
                <button
                  className='text-xs text-blue-600 underline'
                  onClick={() => handleAddReaction(msg.id, '👍')}
                >
                  +1
                </button>
                <button
                  className='text-xs text-blue-600 underline ml-2'
                  onClick={() => handleAddReaction(msg.id, '❤️')}
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className='p-4 border-t border-gray-300 flex gap-2'>
          <input
            className='border p-2 flex-1'
            placeholder='Write a message...'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!selectedChannelId}
          />
          <button
            className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleSendMessage}
            disabled={!selectedChannelId}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
