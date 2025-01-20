import { HttpError } from 'wasp/server'
import type { IngestKnowledge, AskKnowledge } from 'wasp/server/operations'
import fs from 'fs'
import path from 'path'

/**
 * We'll use the official Pinecone client for Node.js / TS:
 *   https://github.com/pinecone-io/pinecone-ts-client
 */
import { Pinecone, type PineconeRecord } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'
import { ChatOpenAI } from '@langchain/openai'

// 1. Instantiate Pinecone client using PINECONE_API_KEY from env:
const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

// 2. Name your Pinecone index. Must match a configured index that either already exists
//    or that you will create once using pineconeClient.createIndex(...)
const PINECONE_INDEX_NAME = 'my-rag-index'

// 3. The dimension should match your embedding model output dimension. For example:
//    - text-embedding-ada-002 => 1536
//    - text-embedding-3-large => 3072
const EMBEDDING_DIM = 1536

// 4. Use a default namespace or any custom one
const RAG_NAMESPACE = 'knowledgeDocs'

// -------------------------------------
// Helpers for chunking, embedding, etc.
// -------------------------------------
/**
 * Breaks a large string into overlapping chunks.
 */
function chunkTexts(
  fullText: string,
  chunkSize = 1000,
  overlapSize = 200
): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < fullText.length) {
    const end = start + chunkSize
    const slice = fullText.slice(start, end)
    chunks.push(slice)
    // Move forward chunkSize minus overlap to preserve context
    start += chunkSize - overlapSize
  }

  return chunks
}

/**
 * Create embeddings for an array of text chunks using a Langchain embedding class.
 */
async function embedTexts(chunks: string[]): Promise<Array<{ chunk: string; embedding: number[] }>> {
  // This references the @langchain/openai OpenAIEmbeddings class:
  const embedder = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    batchSize: 512,
    // Adjust model to a valid embeddings model, e.g. 'text-embedding-ada-002' or 'text-embedding-3-large'.
    // The dimension EMBEDDING_DIM must match.
    modelName: 'text-embedding-ada-002'
  })

  const results: Array<{ chunk: string; embedding: number[] }> = []
  for (const c of chunks) {
    // embedQuery returns an embedding (number[])
    const embedding = await embedder.embedQuery(c)
    results.push({ chunk: c, embedding })
  }

  return results
}

/**
 * Upserts chunk embeddings into Pinecone under PINECONE_INDEX_NAME and RAG_NAMESPACE.
 */
async function storeEmbeddingsToPinecone(
  chunkEmbeddings: Array<{ chunk: string; embedding: number[] }>
): Promise<void> {
  const index = pineconeClient.index(PINECONE_INDEX_NAME)
  // Upsert in small batches for large content if desired
  const toUpsert: PineconeRecord[] = chunkEmbeddings.map((item, i) => ({
    id: `chunk-${i}`,            // or any unique ID
    values: item.embedding,      // vector embedding
    metadata: { chunk: item.chunk }
  }))

  // Target a specific namespace (this creates it if it doesn't exist).
  await index.namespace(RAG_NAMESPACE).upsert(toUpsert)
}

/**
 * Retrieve top K matching chunks from Pinecone for a given user query.
 * Returns an array of chunk strings from metadata.
 */
async function retrieveRelevantChunks(query: string, topK = 5): Promise<string[]> {
  // First embed the query:
  const embedder = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-ada-002'
  })
  const queryEmbedding = await embedder.embedQuery(query)

  const index = pineconeClient.index(PINECONE_INDEX_NAME)
  const results = await index.namespace(RAG_NAMESPACE).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    includeValues: false // we only need the metadata
  })

  if (!results.matches || results.matches.length === 0) {
    return []
  }

  // Each match has .metadata. We'll assume it has shape { chunk: string }
  return results.matches
    .filter(m => m.metadata?.chunk)
    .map(m => String(m.metadata.chunk))
}

/**
 * Generate an answer from the retrieved text chunks + user question
 * using a ChatOpenAI model in Langchain. This is a minimal example
 * with system instructions to only answer from context.
 */
// Modify the generateAnswer function to handle the case where response.content
// might not be strictly a string. Use a fallback or cast to string.

async function generateAnswer(query: string, retrievedChunks: string[]): Promise<string> {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4',
      temperature: 0.2,
      maxTokens: 512
    })
  
    const combinedContext = retrievedChunks.join('\n---\n')
    const systemMsg = `You are an AI that answers questions strictly based on the provided context.
  If the context doesn't contain enough information, respond with:
  "I do not have enough info to answer this question."`
    const userMsg = `Context:\n${combinedContext}\n\nQuestion: ${query}`
  
    const response = await llm.invoke([
      { role: 'system', content: systemMsg },
      { role: 'user', content: userMsg }
    ])
  
    // Safely convert 'response.content' to string.
    // If it's not a string, fallback to an empty string or handle as needed.
    const text = typeof response.content === 'string' ? response.content : String(response.content)
  
    return text.trim()
  }

// -----------------------------------------------------------
// Wasp Action: ingestKnowledge
// Reads knowledgeDocs.md, chunks it, embeds it, and stores in Pinecone.
// -----------------------------------------------------------
export const ingestKnowledge: IngestKnowledge<undefined, string> = async (_args, _context) => {
  // We do NOT need context.user check if it's open to all. Or do:
  // if (!context.user) { throw new HttpError(401, 'Not authenticated') }

  // 1. Load the knowledge doc from local filesystem
  const docPath = path.join(process.cwd(), 'knowledge', 'knowledgeDocs.md')
  if (!fs.existsSync(docPath)) {
    throw new HttpError(404, 'knowledgeDocs.md not found in /knowledge folder.')
  }
  const fullText = fs.readFileSync(docPath, 'utf-8')
  if (!fullText.trim()) {
    throw new HttpError(400, 'knowledgeDocs.md is empty.')
  }

  // 2. Chunk the text
  const chunks = chunkTexts(fullText, 1000, 200)

  // 3. Embed each chunk
  const chunkEmbeds = await embedTexts(chunks)

  // 4. Store into Pinecone
  //    (Ensure your index is created once, e.g. manually or via a script.)
  await storeEmbeddingsToPinecone(chunkEmbeds)

  return `Successfully ingested ${chunkEmbeds.length} chunks into Pinecone index: ${PINECONE_INDEX_NAME}`
}

// -----------------------------------------------------------
// Wasp Query: askKnowledge
// Takes in a user question, retrieves relevant context from Pinecone, and returns a summarized answer.
// -----------------------------------------------------------
type AskKnowledgeArgs = { question: string }

export const askKnowledge: AskKnowledge<AskKnowledgeArgs, string> = async ({ question }, _context) => {
  // if (!context.user) { throw new HttpError(401, 'Not authenticated') }

  if (!question.trim()) {
    throw new HttpError(400, 'Empty question not allowed.')
  }

  // 1. Retrieve top 5 relevant chunks from Pinecone
  const relevantChunks = await retrieveRelevantChunks(question, 5)
  if (!relevantChunks.length) {
    return 'No relevant context found. I do not have enough info to answer this question.'
  }

  // 2. Generate final answer from those chunks
  const answer = await generateAnswer(question, relevantChunks)

  return answer
}
