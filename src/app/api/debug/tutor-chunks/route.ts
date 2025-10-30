import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tutorId = searchParams.get('tutorId')
    
    if (!tutorId) {
      return NextResponse.json({ error: 'tutorId is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Ottieni i documenti associati al tutor
    const { data: tutorDocs, error: tutorError } = await supabase
      .from('tutor_documents')
      .select('document_id')
      .eq('tutor_id', tutorId)

    if (tutorError) {
      return NextResponse.json({ error: tutorError.message }, { status: 500 })
    }

    if (!tutorDocs || tutorDocs.length === 0) {
      return NextResponse.json({ 
        message: 'No documents associated with tutor',
        tutorDocs: [],
        chunks: []
      })
    }

    const documentIds = tutorDocs.map(doc => doc.document_id)

    // Ottieni i chunk per questi documenti
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('*')
      .in('document_id', documentIds)
      .order('created_at', { ascending: false })
      .limit(20)

    if (chunksError) {
      return NextResponse.json({ error: chunksError.message }, { status: 500 })
    }

    return NextResponse.json({
      tutorId,
      documentIds,
      tutorDocsCount: tutorDocs.length,
      chunksCount: chunks?.length || 0,
      chunks: chunks?.map(chunk => ({
        id: chunk.id,
        document_id: chunk.document_id,
        chunk_index: chunk.chunk_index,
        text: chunk.text.substring(0, 200) + '...',
        tokens: chunk.tokens,
        has_embedding: !!chunk.embedding,
        created_at: chunk.created_at
      })) || []
    })

  } catch (error) {
    console.error('Debug tutor chunks error:', error)
    return NextResponse.json({ 
      error: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
