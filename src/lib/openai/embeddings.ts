import OpenAI from 'openai'

// Funzione per ottenere il client OpenAI
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  
  return new OpenAI({
    apiKey,
  })
}

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
  model: string
}

export interface EmbeddingError {
  error: string
  code?: string
}

/**
 * Genera embeddings per un testo usando OpenAI
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<{ data?: EmbeddingResult; error?: EmbeddingError }> {
  try {
    // Validazione input
    if (!text || text.trim().length === 0) {
      return {
        error: {
          error: 'Text cannot be empty',
          code: 'EMPTY_TEXT'
        }
      }
    }

    // Ottieni il client OpenAI
    const openai = getOpenAIClient()

    // Chiamata API OpenAI
    const response = await openai.embeddings.create({
      model,
      input: text.trim(),
      encoding_format: 'float'
    })

    const embedding = response.data[0]
    
    return {
      data: {
        embedding: embedding.embedding,
        tokens: response.usage?.total_tokens || 0,
        model: response.model
      }
    }
  } catch (error) {
    console.error('OpenAI Embeddings Error:', error)
    
    if (error instanceof Error) {
      return {
        error: {
          error: error.message,
          code: 'OPENAI_API_ERROR'
        }
      }
    }

    return {
      error: {
        error: 'Unknown error occurred while generating embeddings',
        code: 'UNKNOWN_ERROR'
      }
    }
  }
}

/**
 * Genera embeddings per multiple stringhe in batch
 */
export async function generateBatchEmbeddings(
  texts: string[],
  model: string = 'text-embedding-3-small'
): Promise<{ data?: EmbeddingResult[]; error?: EmbeddingError }> {
  try {
    if (!texts || texts.length === 0) {
      return {
        error: {
          error: 'Texts array cannot be empty',
          code: 'EMPTY_TEXTS'
        }
      }
    }

    // Ottieni il client OpenAI
    const openai = getOpenAIClient()

    // OpenAI supporta batch processing
    const response = await openai.embeddings.create({
      model,
      input: texts.map(text => text.trim()),
      encoding_format: 'float'
    })

    const totalTokens = response.usage?.total_tokens || 0
    const tokensPerEmbedding = Math.ceil(totalTokens / texts.length)
    
    const embeddings = response.data.map(item => ({
      embedding: item.embedding,
      tokens: tokensPerEmbedding,
      model: response.model
    }))

    return { data: embeddings }
  } catch (error) {
    console.error('OpenAI Batch Embeddings Error:', error)
    
    if (error instanceof Error) {
      return {
        error: {
          error: error.message,
          code: 'OPENAI_BATCH_ERROR'
        }
      }
    }

    return {
      error: {
        error: 'Unknown error occurred while generating batch embeddings',
        code: 'UNKNOWN_BATCH_ERROR'
      }
    }
  }
}

/**
 * Stima il costo degli embeddings in dollari
 */
export function estimateEmbeddingCost(
  tokens: number,
  model: string = 'text-embedding-3-large'
): number {
  // Prezzi per 1K token (dati OpenAI aggiornati)
  const pricing: Record<string, number> = {
    'text-embedding-3-large': 0.00013, // $0.13 per 1K token
    'text-embedding-3-small': 0.00002, // $0.02 per 1K token
    'text-embedding-ada-002': 0.0001,  // $0.10 per 1K token
  }

  const pricePer1K = pricing[model] || pricing['text-embedding-3-small']
  return (tokens / 1000) * pricePer1K
}
