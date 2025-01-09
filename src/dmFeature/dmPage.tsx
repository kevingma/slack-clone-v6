import { FC, useEffect, useState } from 'react'
import { useAuth } from 'wasp/client/auth'
import {
  useQuery,
  getDmChannels,
  createDmChannel,
  getChatMessages,
  createChatMessage,
} from 'wasp/client/operations'

export const DmPage: FC = () => {
  const { data: user } = useAuth()

  // Selected DM channel
  const [selectedDmChannelId, setSelectedDmChannelId] = useState<number | null>(null)
  const [content, setContent] = useState('')

  // For creating a new DM
  const [showNewDmForm, setShowNewDmForm] = useState(false)
  const [dmUserEmail, setDmUserEmail] = useState('')

  // Query all DM channels
  const {
    data: dmChannels = [],
    refetch: refetchDmChannels,
  } = useQuery(getDmChannels)

  // Query messages for the selected DM channel
  const { data: messages, refetch: refetchMessages } = useQuery(
    getChatMessages,
    { channelId: selectedDmChannelId || 0 },
    { enabled: !!selectedDmChannelId }
  )

  // Polling messages (simple approach)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDmChannelId) refetchMessages()
    }, 2000)
    return () => clearInterval(interval)
  }, [selectedDmChannelId, refetchMessages])

  // Send new message
  const handleSendMessage = async () => {
    if (!content.trim() || !selectedDmChannelId) return
    try {
      await createChatMessage({ content, channelId: selectedDmChannelId })
      setContent('')
      refetchMessages()
    } catch (err: any) {
      window.alert('Error sending message: ' + err.message)
    }
  }

  // Create new DM channel
  const handleCreateDm = async () => {
    if (!dmUserEmail.trim()) return
    try {
      await createDmChannel({ otherUserEmail: dmUserEmail })
      setDmUserEmail('')
      setShowNewDmForm(false)
      refetchDmChannels()
    } catch (err: any) {
      window.alert('Error creating DM channel: ' + err.message)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex'>
      {/* DM Sidebar */}
      <div className='w-64 bg-gray-200 flex flex-col p-4 h-full'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-bold'>DMs</h3>
          <button
            className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors'
            onClick={() => setShowNewDmForm(!showNewDmForm)}
          >
            New
          </button>
        </div>

        {showNewDmForm && (
          <div className='mb-4'>
            <input
              className='border p-1 w-full mb-2'
              placeholder='Enter user email'
              value={dmUserEmail}
              onChange={(e) => setDmUserEmail(e.target.value)}
            />
            <button
              className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors w-full'
              onClick={handleCreateDm}
            >
              Start DM
            </button>
          </div>
        )}

        {/* DM Channel List */}
        <ul className='space-y-2 flex-1 overflow-y-auto'>
          {dmChannels.map((dm: any) => (
            <li
              key={dm.id}
              className={`cursor-pointer p-2 hover:bg-gray-300 ${
                dm.id === selectedDmChannelId ? 'bg-gray-300 font-semibold' : ''
              }`}
              onClick={() => setSelectedDmChannelId(dm.id)}
            >
              {dm.name}
            </li>
          ))}
        </ul>
      </div>

      {/* DM Chat Messages */}
      <div className='flex-1 flex flex-col border-l border-gray-300 h-full overflow-hidden'>
        <div className='p-4 border-b border-gray-300'>
          <h2 className='text-2xl font-bold'>
            {selectedDmChannelId
              ? dmChannels.find((ch: any) => ch.id === selectedDmChannelId)?.name
              : '(No DM)'}  
          </h2>
        </div>
        <div className='flex-1 overflow-y-auto bg-gray-50 p-4'>
          {messages?.map((msg: any) => (
            <div key={msg.id} className='flex items-start mb-4'>
              <img
                src='https://placehold.co/32x32'
                alt='User Avatar'
                className='w-8 h-8 rounded-full mr-3'
              />
              <div>
                <div className='text-sm text-gray-700 font-semibold mb-1'>
                  {msg.user?.displayName ?? msg.user?.email ?? 'Unknown User'}
                </div>
                <div className='bg-white p-2 border border-gray-200'>
                  {msg.content}
                </div>
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
            disabled={!selectedDmChannelId}
          />
          <button
            className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors'
            onClick={handleSendMessage}
            disabled={!selectedDmChannelId}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
