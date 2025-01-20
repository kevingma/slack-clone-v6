import { FC, useState } from 'react'
import { askKnowledge, ingestKnowledge } from 'wasp/client/operations'

export const RagPage: FC = () => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [ingesting, setIngesting] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setAnswer('')
    try {
      const response = await askKnowledge({ question })
      setAnswer(response)
    } catch (err: any) {
      window.alert('Error asking knowledge: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleIngest = async () => {
    setIngesting(true)
    try {
      const result = await ingestKnowledge()
      window.alert(result)
    } catch (err: any) {
      window.alert('Error ingesting knowledge: ' + err.message)
    } finally {
      setIngesting(false)
    }
  }

  return (
    <div className='flex-1 bg-gray-900 text-white p-4'>
      <div className='max-w-xl mx-auto mt-10'>
        <h1 className='text-2xl font-bold mb-4'>RAG Q&A</h1>

        <div className='mb-6'>
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className='px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors'
          >
            {ingesting ? 'Ingesting...' : 'Ingest Knowledge Docs'}
          </button>
        </div>

        <div className='mb-4'>
          <label className='block mb-1 font-semibold'>Ask a Question</label>
          <input
            type='text'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='Type your question about the knowledge docs...'
            className='w-full p-2 rounded-md border border-gray-700 bg-gray-800 placeholder-gray-500'
          />
        </div>

        <button
          onClick={handleAsk}
          disabled={loading}
          className='px-4 py-2 bg-green-600 rounded-md hover:bg-green-500 transition-colors'
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>

        {answer && (
          <div className='mt-6 bg-gray-800 border border-gray-700 p-4 rounded-md'>
            <h2 className='font-bold mb-2'>Answer:</h2>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  )
}