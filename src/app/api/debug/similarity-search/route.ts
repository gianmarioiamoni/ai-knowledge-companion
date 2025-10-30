import { NextRequest, NextResponse } from 'next/server'
import { searchTutorChunks } from '@/lib/supabase/similarity-search'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tutorId = searchParams.get('tutorId')
    const query = searchParams.get('query') || 'Gianmario full stack developer'
    
    if (!tutorId) {
      return NextResponse.json({ error: 'tutorId is required' }, { status: 400 })
    }

    console.log(`🔍 Testing similarity search for tutorId: ${tutorId}, query: "${query}"`)

    const result = await searchTutorChunks(query, tutorId, {
      limit: 10,
      threshold: 0.1
    })

    return NextResponse.json({
      tutorId,
      query,
      success: !result.error,
      error: result.error,
      data: result.data?.map(chunk => ({
        id: chunk.id,
        document_id: chunk.document_id,
        chunk_index: chunk.chunk_index,
        text: chunk.text.substring(0, 200) + '...',
        tokens: chunk.tokens,
        similarity: chunk.similarity,
        created_at: chunk.created_at
      })) || []
    })

  } catch (error) {
    console.error('Similarity search test error:', error)
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
