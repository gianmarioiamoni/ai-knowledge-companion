import { createClient } from './client'
import { generateEmbedding } from '@/lib/openai/embeddings'

export interface SimilarityResult {
  id: string
  document_id: string
  chunk_index: number
  text: string
  tokens: number
  similarity: number
  created_at: string
}

export interface SearchOptions {
  limit?: number
  threshold?: number
  documentIds?: string[]
  userId?: string
}

/**
 * Cerca chunk simili usando similarity search con pgvector
 */
export async function searchSimilarChunks(
  query: string,
  options: SearchOptions = {}
): Promise<{ data?: SimilarityResult[]; error?: string }> {
  try {
    const {
      limit = 10,
      threshold = 0.7,
      documentIds,
      userId
    } = options

    // Genera embedding per la query
    const embeddingResult = await generateEmbedding(query)
    
    if (embeddingResult.error) {
      return {
        error: `Failed to generate query embedding: ${embeddingResult.error.error}`
      }
    }

    if (!embeddingResult.data) {
      return {
        error: 'No embedding data returned for query'
      }
    }

    const supabase = createClient()
    const queryEmbedding = embeddingResult.data.embedding

    // I filtri sono gestiti direttamente dalla RPC function

    // Esegui la query di similarità usando pgvector
    const { data, error } = await supabase.rpc('match_document_chunks_filtered', {
      query_embedding: queryEmbedding,
      document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
      user_id: userId,
      match_threshold: threshold,
      match_count: limit
    })

    if (error) {
      console.error('Similarity search error:', error)
      return {
        error: `Database query failed: ${error.message}`
      }
    }

    // Trasforma i risultati nel formato desiderato
    const results: SimilarityResult[] = (data || []).map((item: any) => ({
      id: item.id,
      document_id: item.document_id,
      chunk_index: item.chunk_index,
      text: item.text,
      tokens: item.tokens,
      similarity: item.similarity || 0,
      created_at: item.created_at
    }))

    return { data: results }
  } catch (error) {
    console.error('Similarity search error:', error)
    return {
      error: `Search failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    }
  }
}

/**
 * Cerca chunk simili per un tutor specifico
 */
export async function searchTutorChunks(
  query: string,
  tutorId: string,
  options: Omit<SearchOptions, 'documentIds'> = {}
): Promise<{ data?: SimilarityResult[]; error?: string }> {
  try {
    const supabase = createClient()

    // Ottieni i documenti associati al tutor
    const { data: tutorDocs, error: tutorError } = await supabase
      .from('tutor_documents')
      .select('document_id')
      .eq('tutor_id', tutorId)

    if (tutorError) {
      return {
        error: `Failed to get tutor documents: ${tutorError.message}`
      }
    }

    if (!tutorDocs || tutorDocs.length === 0) {
      return {
        data: [] // Nessun documento associato al tutor
      }
    }

    const documentIds = tutorDocs.map(doc => doc.document_id)

    return await searchSimilarChunks(query, {
      ...options,
      documentIds
    })
  } catch (error) {
    console.error('Tutor similarity search error:', error)
    return {
      error: `Tutor search failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    }
  }
}

/**
 * Ottieni statistiche sui chunk per un utente
 */
export async function getChunkStats(
  userId: string
): Promise<{ 
  data?: { 
    totalChunks: number
    totalTokens: number
    documentsWithEmbeddings: number
  }; 
  error?: string 
}> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('document_chunks')
      .select(`
        tokens,
        documents!inner(
          owner_id,
          id
        )
      `)
      .not('embedding', 'is', null)
      .eq('documents.owner_id', userId)

    if (error) {
      return {
        error: `Failed to get chunk stats: ${error.message}`
      }
    }

    const totalChunks = data?.length || 0
    const totalTokens = data?.reduce((sum, chunk) => sum + (chunk.tokens || 0), 0) || 0
    const documentsWithEmbeddings = new Set(data?.map(chunk => chunk.documents.id) || []).size

    return {
      data: {
        totalChunks,
        totalTokens,
        documentsWithEmbeddings
      }
    }
  } catch (error) {
    console.error('Chunk stats error:', error)
    return {
      error: `Stats failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    }
  }
}
