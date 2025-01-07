import { FC, useEffect, useState } from 'react'
import {
  useQuery,
  getChatMessages,
  createChatMessage,
  getChannels
} from 'wasp/client/operations'
import { ContainerWithFlatShadow } from '../client/components/containerWithFlatShadow'
import { useAuth } from 'wasp/client/auth'

export const ChatPage: FC = () => {
  const { data: user } = useAuth()

  // Provide a default value of empty array for channels
  const { data: channels = [] } = useQuery(getChannels)

  // Track selectedChannelId in state
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined)

  // Query for chat messages in the selected channel (or default #general)
  const {
    data: messages,
    isFetching,
    refetch
  } = useQuery(getChatMessages, { channelId: selectedChannelId })

  const [content, setContent] = useState('')

  // Poll for new messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 2000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleSendMessage = async () => {
    if (!content.trim()) return
    try {
      await createChatMessage({ content, channelId: selectedChannelId })
      setContent('')
      // Immediately refetch so user sees their message
      refetch()
    } catch (err: any) {
      window.alert('Error sending message: ' + err.message)
    }
  }

  const handleSelectChannel = (channelId?: number) => {
    setSelectedChannelId(channelId)
  }

  return (
    <div className='flex'>
      {/* Sidebar */}
      <div className='w-64 bg-gray-200 h-screen p-4'>
        <h3 className='text-xl font-bold mb-2'>Channels</h3>
        <ul className='space-y-2'>
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
      <div className='flex-1'>
        <ContainerWithFlatShadow>
          <h2 className='text-2xl font-bold mb-4'>
            {selectedChannelId
              ? channels.find(ch => ch.id === selectedChannelId)?.name
              : '#general'}{' '}
            Chat
          </h2>
          <div className='border border-gray-300 p-4 h-96 overflow-y-auto mb-4 bg-gray-50'>
            {isFetching && <p className='text-sm text-gray-400'>Loading...</p>}
            {messages?.map(msg => (
              <div key={msg.id} className='mb-4'>
                <div className='text-sm text-gray-700 font-semibold mb-1'>
                  {msg.user?.username ?? msg.user?.email ?? 'Unknown User'}
                </div>
                <div className='bg-white p-2 border border-gray-200'>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className='flex gap-2'>
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
        </ContainerWithFlatShadow>
      </div>
    </div>
  )
}