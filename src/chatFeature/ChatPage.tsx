import { FC, useEffect, useState } from 'react'
import { useQuery, getChatMessages, createChatMessage } from 'wasp/client/operations'
import { ContainerWithFlatShadow } from '../client/components/containerWithFlatShadow'
import { useAuth } from 'wasp/client/auth'

export const ChatPage: FC = () => {
  const { data: user } = useAuth()
  const { data: messages, isFetching, refetch } = useQuery(getChatMessages)
  const [content, setContent] = useState('')

  // For "real-time" effect, poll every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 2000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleSendMessage = async () => {
    if (!content.trim()) return
    try {
      await createChatMessage({ content })
      setContent('')
      // Immediately refetch, so the user sees their own message ASAP
      refetch()
    } catch (err: any) {
      window.alert('Error sending message: ' + err.message)
    }
  }

  return (
    <ContainerWithFlatShadow>
      <h2 className='text-2xl font-bold mb-4'>Global Chat</h2>
      <div className='border border-gray-300 p-4 h-96 overflow-y-auto mb-4 bg-gray-50'>
        {isFetching && <p className='text-sm text-gray-400'>Loading...</p>}
        {messages?.map(msg => (
          <div key={msg.id} className='mb-4'>
            <div className='text-sm text-gray-700 font-semibold mb-1'>
              {msg.user?.identities.username?.id ?? 'Unknown User'}
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
  )
}