import { FC, useEffect, useState } from 'react'
import {
  useQuery,
  getChatMessages,
  createChatMessage,
  getChannels,
  createChannel
} from 'wasp/client/operations'
import { useAuth } from 'wasp/client/auth'

export const ChatPage: FC = () => {
  const { data: user } = useAuth()

  const { data: channels = [], refetch: refetchChannels } = useQuery(getChannels)
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined)

  const {
    data: messages,
    isFetching,
    refetch: refetchMessages
  } = useQuery(getChatMessages, { channelId: selectedChannelId })

  const [content, setContent] = useState('')
  const [showNewChannelForm, setShowNewChannelForm] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages()
    }, 2000)
    return () => clearInterval(interval)
  }, [refetchMessages])

  const handleSendMessage = async () => {
    if (!content.trim()) return
    try {
      await createChatMessage({ content, channelId: selectedChannelId })
      setContent('')
      refetchMessages()
    } catch (err: any) {
      window.alert('Error sending message: ' + err.message)
    }
  }

  const handleSelectChannel = (channelId?: number) => {
    setSelectedChannelId(channelId)
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return
    try {
      await createChannel({ name: newChannelName })
      setNewChannelName('')
      setShowNewChannelForm(false)
      refetchChannels()
    } catch (err: any) {
      window.alert('Error creating channel: ' + err.message)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex'>
      {/* Sidebar */}
      <div className='w-64 bg-gray-200 flex flex-col p-4 h-full'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold'>Channels</h3>
          <button
            className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors'
            onClick={() => setShowNewChannelForm(!showNewChannelForm)}
          >
            New Channel
          </button>
        </div>
        {showNewChannelForm && (
          <div className='mb-4'>
            <input
              type='text'
              className='border p-1 w-full mb-2'
              placeholder='Channel name'
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <button
              className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors w-full'
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
              onClick={() => handleSelectChannel(channel.id)}
            >
              {channel.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Section */}
      <div className='flex-1 flex flex-col border-l border-gray-300 h-full overflow-hidden'>
        <div className='p-4 border-b border-gray-300'>
          <h2 className='text-2xl font-bold'>
            {selectedChannelId
              ? channels.find(ch => ch.id === selectedChannelId)?.name
              : '#general'}{' '}
            Chat
          </h2>
        </div>
        <div className='flex-1 overflow-y-auto bg-gray-50 p-4'>
          {isFetching && <p className='text-sm text-gray-400'>Loading...</p>}
          {messages?.map(msg => (
            <div key={msg.id} className='mb-4'>
              <div className='text-sm text-gray-700 font-semibold mb-1'>
                {(msg.user as any)?.displayName ??
                  msg.user?.email ??
                  'Unknown User'}
              </div>
              <div className='bg-white p-2 border border-gray-200'>
                {msg.content}
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
          />
          <button
            className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors'
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
