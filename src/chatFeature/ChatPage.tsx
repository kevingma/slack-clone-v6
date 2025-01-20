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
  removeReaction,
  createThreadChannel,
  getThreadChannel,
  uploadAttachment
} from 'wasp/client/operations'
import type { Workspace, User, Reaction, ChatMessage, Channel, Attachment } from 'wasp/entities'

type ChatMessageWithReactionsAndAttachments = ChatMessage & {
  user: User
  reactions: (Reaction & { user: User })[]
  attachments: Attachment[]
}

export const ChatPage: FC = () => {
  const { data: user } = useAuth()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null)
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>()
  const [selectedThreadChannelId, setSelectedThreadChannelId] = useState<number | null>(null)
  const [threadContent, setThreadContent] = useState('')

  const { data: workspaces = [], refetch: refetchWorkspaces } = useQuery(getWorkspaces)
  const { data: channels = [], refetch: refetchChannels } = useQuery(
    getChannels,
    { workspaceId: selectedWorkspaceId ?? 0 },
    { enabled: !!selectedWorkspaceId }
  )
  const { data: messages = [], refetch: refetchMessages } = useQuery(
    getChatMessages,
    selectedChannelId !== undefined ? { channelId: selectedChannelId } : undefined,
    { enabled: selectedChannelId !== undefined }
  )
  const { data: threadMessages = [], refetch: refetchThreadMessages } = useQuery(
    getThreadChannel,
    selectedThreadChannelId !== null ? { threadChannelId: selectedThreadChannelId } : undefined,
    { enabled: selectedThreadChannelId !== null }
  )

  const [content, setContent] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [showNewChannelForm, setShowNewChannelForm] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChannelId) refetchMessages()
    }, 2000)
    return () => clearInterval(interval)
  }, [selectedChannelId, refetchMessages])

  useEffect(() => {
    if (!selectedThreadChannelId) return
    const interval = setInterval(() => {
      refetchThreadMessages()
    }, 2000)
    return () => clearInterval(interval)
  }, [selectedThreadChannelId, refetchThreadMessages])

  const handleSendMessage = async () => {
    if (!selectedChannelId) return
    if (!content.trim() && !selectedFile) return

    try {
      const newMessage = await createChatMessage({ content, channelId: selectedChannelId })
      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile)
        await uploadAttachment({
          fileName: selectedFile.name,
          fileContent: base64,
          messageId: newMessage.id
        })
        setSelectedFile(null)
      }
      setContent('')
      refetchMessages()
    } catch (err: any) {
      window.alert('Error sending message or uploading attachment: ' + err.message)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
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

  const handleOpenThread = async (messageId: number) => {
    try {
      const threadChannel: Channel = await createThreadChannel({ parentMessageId: messageId })
      setSelectedThreadChannelId(threadChannel.id)
    } catch (err: any) {
      window.alert('Error creating/opening thread: ' + err.message)
    }
  }

  const handleSendThreadMessage = async () => {
    if (!threadContent.trim() || !selectedThreadChannelId) return
    try {
      await createChatMessage({ content: threadContent, channelId: selectedThreadChannelId })
      setThreadContent('')
      refetchThreadMessages()
    } catch (err: any) {
      window.alert('Error sending thread message: ' + err.message)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1] || '')
        } else {
          reject(new Error('Failed to read file as base64.'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className='w-full h-full flex'>
      {/* Left sidebar - now a light grey */}
      <div className='w-64 bg-gray-300 text-black flex flex-col p-4 h-full'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-bold'>Workspaces</h3>
          <button
            className='bg-blue-600 text-black px-2 py-1 rounded-md hover:bg-gray-400 transition-colors'
            onClick={() => setShowNewWorkspaceForm(!showNewWorkspaceForm)}
          >
            New
          </button>
        </div>
        {showNewWorkspaceForm && (
          <div className='mb-4'>
            <input
              className='border border-gray-400 p-1 w-full mb-2 bg-gray-200 text-black rounded-md'
              placeholder='Workspace name'
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
            <button
              className='bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-500 transition-colors w-full'
              onClick={handleCreateWorkspace}
            >
              Create Workspace
            </button>
          </div>
        )}
        <div className='mb-4'>
          <label className='block mb-1 font-semibold'>Select Workspace:</label>
          <select
            className='w-full border border-gray-400 p-1 bg-gray-200 text-black rounded-md'
            value={selectedWorkspaceId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null
              setSelectedWorkspaceId(val)
              setSelectedChannelId(undefined)
              setSelectedThreadChannelId(null)
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
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold'>Channels</h3>
          <button
            className='bg-blue-600 text-black px-2 py-1 rounded-md hover:bg-gray-400 transition-colors'
            onClick={() => setShowNewChannelForm(!showNewChannelForm)}
            disabled={!selectedWorkspaceId}
          >
            New
          </button>
        </div>
        {showNewChannelForm && selectedWorkspaceId && (
          <div className='mb-4'>
            <input
              type='text'
              className='border border-gray-400 p-1 w-full mb-2 bg-gray-200 text-black rounded-md'
              placeholder='Channel name'
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <button
              className='bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-500 transition-colors w-full'
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
              className={`cursor-pointer p-2 rounded-md hover:bg-gray-300 transition-colors ${
                channel.id === selectedChannelId ? 'bg-gray-300 font-semibold' : ''
              }`}
              onClick={() => {
                setSelectedChannelId(channel.id)
                setSelectedThreadChannelId(null)
              }}
            >
              {channel.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main chat area - use the same light grey */}
      <div className='flex-1 flex flex-col border-l border-gray-400 bg-gray-200 text-black'>
        {/* Channel header - mild grey */}
        <div className='p-4 border-b border-gray-400 bg-gray-300 text-black'>
          <h2 className='text-2xl font-bold'>
            {selectedChannelId
              ? channels.find(ch => ch.id === selectedChannelId)?.name
              : '(No Channel)'} Chat
          </h2>
        </div>

        {/* Messages list - light grey */}
        <div className='flex-1 overflow-y-auto bg-gray-200 p-4 min-h-0'>
          {Array.isArray(messages) &&
            (messages as ChatMessageWithReactionsAndAttachments[]).map(msg => (
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
                    <div className='text-sm font-semibold'>
                      {msg.user.displayName || msg.user.username || msg.user.email}
                    </div>
                    <div className='bg-gray-300 p-2 border border-gray-400 rounded-md'>
                      {msg.content}
                    </div>
                    {msg.attachments.length > 0 && (
                      <div className='mt-2 flex gap-2 flex-wrap'>
                        {msg.attachments.map(attachment => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-blue-600 underline'
                          >
                            {attachment.filename || 'Attachment'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {msg.reactions.length > 0 && (
                  <div className='ml-11 mt-1 flex gap-2 flex-wrap'>
                    {msg.reactions.map(reaction => (
                      <button
                        key={reaction.id}
                        className='bg-gray-300 px-1 rounded-md text-sm flex items-center gap-1'
                        onClick={() => handleRemoveReaction(msg.id, reaction.emoji)}
                        title='Click to remove your reaction'
                      >
                        <span>{reaction.emoji}</span>
                        {reaction.userId === user?.id && <span>(You)</span>}
                      </button>
                    ))}
                  </div>
                )}
                <div className='ml-11 mt-1 flex items-center gap-3'>
                  <button
                    className='text-xs text-blue-600 underline'
                    onClick={() => handleAddReaction(msg.id, '👍')}
                  >
                    +1
                  </button>
                  <button
                    className='text-xs text-blue-600 underline'
                    onClick={() => handleAddReaction(msg.id, '❤️')}
                  >
                    ❤️
                  </button>
                  <button
                    className='text-xs text-blue-600 underline'
                    onClick={() => handleOpenThread(msg.id)}
                  >
                    Thread
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Bottom input row - also light grey */}
        <div className='p-4 border-t border-gray-400 flex gap-2 bg-gray-200'>
          <input
            type='file'
            onChange={handleFileChange}
            className='hidden'
            id='chat-attachment-input'
          />
          <label
            htmlFor='chat-attachment-input'
            className='px-3 py-2 bg-gray-300 border border-gray-400 cursor-pointer hover:bg-gray-400 rounded-md text-black'
          >
            Attach
          </label>

          <input
            className='border border-gray-400 bg-gray-200 p-2 flex-1 rounded-md placeholder-gray-500 text-black'
            placeholder='Write a message...'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={!selectedChannelId}
          />
          <button
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500'
            onClick={handleSendMessage}
            disabled={!selectedChannelId}
          >
            Send
          </button>
        </div>
      </div>

      {/* Thread panel on the right side (no changes to color scheme here or we can match the rest) */}
      {selectedThreadChannelId && (
        <div className='w-80 border-l border-gray-400 flex flex-col bg-gray-200'>
          <div className='p-4 border-b border-gray-400 bg-gray-300 text-black'>
            <h2 className='text-lg font-bold'>Thread</h2>
          </div>
          <div className='flex-1 overflow-y-auto bg-gray-200 p-4 min-h-0'>
            {Array.isArray(threadMessages) &&
              threadMessages.map(
                (msg: ChatMessage & { user: User; attachments: Attachment[] }) => (
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
                        <div className='text-sm font-semibold'>
                          {msg.user.displayName || msg.user.username || msg.user.email}
                        </div>
                        <div className='bg-gray-300 p-2 border border-gray-400 rounded-md'>
                          {msg.content}
                        </div>
                        {msg.attachments.length > 0 && (
                          <div className='mt-2 flex gap-2 flex-wrap'>
                            {msg.attachments.map(attachment => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-sm text-blue-600 underline'
                              >
                                {attachment.filename || 'Attachment'}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
          </div>
          <div className='p-4 border-t border-gray-400 flex gap-2 bg-gray-200'>
            <input
              className='border border-gray-400 bg-gray-200 p-2 flex-1 rounded-md placeholder-gray-500 text-black'
              placeholder='Reply in thread...'
              value={threadContent}
              onChange={(e) => setThreadContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendThreadMessage()
                }
              }}
            />
            <button
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500'
              onClick={handleSendThreadMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}