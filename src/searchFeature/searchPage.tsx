import { FC, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery, searchMessages } from 'wasp/client/operations'
import type { ChatMessage, User, Channel, Attachment } from 'wasp/entities'

type SearchResult = ChatMessage & {
  user: User
  channel: Channel
  attachments: Attachment[]
}

export const SearchPage: FC = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const initialQuery = params.get('query') || ''
  const [searchTerm, setSearchTerm] = useState(initialQuery)

  // Trigger the search query using the searchTerm
  const { data: results, refetch } = useQuery(
    searchMessages,
    { query: searchTerm },
    { enabled: !!searchTerm }
  )

  useEffect(() => {
    // If user navigates directly to /search?query=...
    // we'd want to re-run query if the param changes
    if (initialQuery && initialQuery !== searchTerm) {
      setSearchTerm(initialQuery)
    }
  }, [initialQuery, searchTerm])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  return (
    <div className='w-full h-full overflow-hidden flex flex-col'>
      <div className='p-4 border-b border-gray-300 flex items-center'>
        <form onSubmit={handleSubmit} className='flex items-center gap-2 w-full'>
          <input
            className='border p-2 flex-1'
            placeholder='Search across all messages...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
            type='submit'
          >
            Search
          </button>
        </form>
      </div>

      <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
        {results && results.length > 0 ? (
          <ul className='space-y-4'>
            {results.map((msg: SearchResult) => (
              <li key={msg.id} className='bg-white p-3 shadow border'>
                <div className='text-sm text-gray-700 font-semibold'>
                  {msg.user.displayName || msg.user.username || msg.user.email}
                  {' in '}
                  {msg.channel.isDm
                    ? `[DM: ${msg.channel.name}]`
                    : `[Workspace Channel: ${msg.channel.name}]`}
                </div>
                <div className='mt-1 text-black'>{msg.content}</div>
                {msg.attachments.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 underline text-sm'
                      >
                        {att.filename || 'Attachment'}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-gray-500'>No results found.</p>
        )}
      </div>
    </div>
  )
}
