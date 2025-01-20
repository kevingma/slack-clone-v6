import type { InitializeIndex, AskRag } from 'wasp/server/operations' // <-- Was: "Action" from "wasp/server/types", now use the correct types
import { HttpError } from 'wasp/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { Document } from '@langchain/core/documents'
import { v4 as uuidv4 } from 'uuid'

// Example input types for the operations.
type RagInitArgs = Record<string, never>
type RagAskArgs = { query: string }

export const initializeIndex: InitializeIndex<RagInitArgs, string> = async (_args, _context) => {
  // 1) Init Pinecone client
  const pinecone = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY || '' 
  })

  // 2) Check if index exists, if not create it
  const indexName = 'my-rag-index'
  const indexes = await pinecone.listIndexes()
  if (!indexes.indexes?.some(idx => idx.name === indexName)) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536,  // for OpenAI embeddings
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
    })
  }

  return `Index "${indexName}" is ready or already exists.`
}

export const askRag: AskRag<RagAskArgs, string> = async ({ query }, _context) => {
  if (!query?.trim()) {
    throw new HttpError(400, 'Missing query')
  }

  // 1) Init Pinecone client
  const pinecone = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY || '' 
  })
  const index = pinecone.index('my-rag-index')

  // 2) Create a vector store from the existing index
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    }),
    { pineconeIndex: index }
  )

  // 3) Perform a similarity search
  const relevantDocs = await vectorStore.similaritySearch(query, 3)
  // For demonstration, we just return the docs as a string.
  // Normally you'd send these docs into an LLM chain to generate an answer.
  const relevantText = relevantDocs
    .map((doc: Document) => doc.pageContent)
    .join('\n---\n')

  return `Top matches for "${query}":\n\n${relevantText}`
}