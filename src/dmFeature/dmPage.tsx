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

  const [selectedDmChannelId, setSelectedDmChannelId] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [showNewDmForm, setShowNewDmForm] = useState(false)
  const [dmUserEmail, setDmUserEmail] = useState('')

  const { data: dmChannels = [], refetch: refetchDmChannels } = useQuery(getDmChannels)
  const { data: messages, refetch: refetchMessages } = useQuery(
    getChatMessages,
    { channelId: selectedDmChannelId || 0 },
    { enabled: !!selectedDmChannelId }
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDmChannelId) refetchMessages()
    }, 2000)
    return () => clearInterval(interval)
  }, [selectedDmChannelId, refetchMessages])

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
      {/* DM Sidebar - now light grey */}
      <div className='w-64 bg-gray-300 text-black flex flex-col p-4 h-full'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-bold'>DMs</h3>
          <button
            className='bg-blue-600 text-black px-2 py-1 rounded-md hover:bg-gray-400 transition-colors'
            onClick={() => setShowNewDmForm(!showNewDmForm)}
          >
            New
          </button>
        </div>

        {showNewDmForm && (
          <div className='mb-4'>
            <input
              className='border border-gray-400 p-1 w-full mb-2 bg-gray-200 text-black rounded-md placeholder-gray-500'
              placeholder='Enter user email'
              value={dmUserEmail}
              onChange={(e) => setDmUserEmail(e.target.value)}
            />
            <button
              className='bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-500 transition-colors w-full'
              onClick={handleCreateDm}
            >
              Start DM
            </button>
          </div>
        )}

        <ul className='space-y-2 flex-1 overflow-y-auto'>
          {dmChannels.map((dm: any) => (
            <li
              key={dm.id}
              className={`cursor-pointer p-2 rounded-md hover:bg-gray-300 transition-colors ${
                dm.id === selectedDmChannelId ? 'bg-gray-300 font-semibold' : ''
              }`}
              onClick={() => setSelectedDmChannelId(dm.id)}
            >
              {dm.name}
            </li>
          ))}
        </ul>
      </div>

      {/* DM Chat Messages - also light grey */}
      <div className='flex-1 flex flex-col border-l border-gray-400 bg-gray-200 text-black'>
        {/* Box that has the channel (DM) name - mild grey */}
        <div className='p-4 border-b border-gray-400 bg-gray-300 text-black'>
          <h2 className='text-2xl font-bold'>
            {selectedDmChannelId
              ? dmChannels.find((ch: any) => ch.id === selectedDmChannelId)?.name
              : '(No DM)'}  
          </h2>
        </div>
        <div className='flex-1 overflow-y-auto bg-gray-200 p-4'>
          {messages?.map((msg: any) => (
            <div key={msg.id} className='flex items-start mb-4'>
              <img
                src='https://placehold.co/32x32'
                alt='User Avatar'
                className='w-8 h-8 rounded-full mr-3'
              />
              <div>
                <div className='text-sm font-semibold mb-1'>
                  {msg.user?.displayName ?? msg.user?.email ?? 'Unknown User'}
                </div>
                <div className='bg-gray-300 p-2 border border-gray-400 rounded-md'>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='p-4 border-t border-gray-400 flex gap-2 bg-gray-200'>
          <input
            className='border border-gray-400 bg-gray-200 p-2 flex-1 rounded-md placeholder-gray-500 text-black'
            placeholder='Write a message...'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!selectedDmChannelId}
          />
          <button
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors'
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
