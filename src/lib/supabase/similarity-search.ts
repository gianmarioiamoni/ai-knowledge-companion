// Use service client on the server to avoid RLS blocking internal retrieval
import { createServiceClient } from '@/lib/supabase/service'
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

type RawSimilarityMatch = {
  id: string
  document_id: string
  chunk_index: number
  text: string
  tokens: number
  similarity?: number
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
      limit = 20,
      threshold = 0.05,
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

    const supabase = createServiceClient()
    const queryEmbedding = embeddingResult.data.embedding

    // I filtri sono gestiti direttamente dalla RPC function

    // Esegui la query di similarità usando pgvector
    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
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
    let results: SimilarityResult[] = (data || []).map((item: RawSimilarityMatch) => ({
      id: item.id,
      document_id: item.document_id,
      chunk_index: item.chunk_index,
      text: item.text,
      tokens: item.tokens,
      similarity: item.similarity || 0,
      created_at: item.created_at
    }))

    // Applica filtri manualmente se necessario
    if (documentIds && documentIds.length > 0) {
      results = results.filter(result => documentIds.includes(result.document_id))
    }

    // Per il filtro utente, dobbiamo fare una query separata per ottenere i documenti
    if (userId) {
      const { data: userDocs } = await supabase
        .from('documents')
        .select('id, owner_id, visibility')
        .or(`owner_id.eq.${userId},visibility.eq.public`)
      
      const allowedDocIds = userDocs?.map(doc => doc.id) || []
      results = results.filter(result => allowedDocIds.includes(result.document_id))
    }

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
    console.log(`🔍 Searching tutor chunks for tutorId: ${tutorId}`)
    const supabase = createServiceClient()

    // Ottieni i documenti associati al tutor
    const { data: tutorDocs, error: tutorError } = await supabase
      .from('tutor_documents')
      .select('document_id')
      .eq('tutor_id', tutorId)

    if (tutorError) {
      console.error('❌ Error fetching tutor documents:', tutorError)
      return {
        error: `Failed to get tutor documents: ${tutorError.message}`
      }
    }

    console.log(`📄 Tutor documents found:`, tutorDocs?.length || 0)
    console.log(`📄 Document IDs:`, tutorDocs?.map(doc => doc.document_id) || [])

    if (!tutorDocs || tutorDocs.length === 0) {
      console.log('⚠️ No documents associated with tutor')
      return {
        data: [] // Nessun documento associato al tutor
      }
    }

    const documentIds = tutorDocs.map(doc => doc.document_id)

    console.log(`🔍 Searching similar chunks with documentIds:`, documentIds)
    const result = await searchSimilarChunks(query, {
      ...options,
      documentIds
    })

    console.log(`📋 Tutor search result:`, {
      hasData: !!result.data,
      dataLength: result.data?.length || 0,
      error: result.error
    })

    return result
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
    const supabase = createServiceClient()

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

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const totalChunks = data?.length || 0
    const totalTokens = data?.reduce((sum: number, chunk: any) => sum + (chunk.tokens || 0), 0) || 0
    const documentsWithEmbeddings = new Set(data?.map((chunk: any) => chunk.documents?.id) || []).size
    /* eslint-enable @typescript-eslint/no-explicit-any */

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
