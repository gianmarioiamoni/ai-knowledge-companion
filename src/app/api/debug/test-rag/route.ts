import { NextRequest, NextResponse } from 'next/server'
import { queryTutorRAG } from '@/lib/openai/rag'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { tutorId, question } = await request.json()
    
    if (!tutorId || !question) {
      return NextResponse.json({ error: 'tutorId and question are required' }, { status: 400 })
    }

    console.log(`🔍 Testing RAG for tutorId: ${tutorId}, question: "${question}"`)

    const result = await queryTutorRAG(question, tutorId, undefined, {
      maxChunks: 10,
      similarityThreshold: 0.1
    })

    return NextResponse.json({
      tutorId,
      question,
      success: !result.error,
      error: result.error,
      data: result.data ? {
        answer: result.data.answer,
        sourcesCount: result.data.sources.length,
        sources: result.data.sources.map(source => ({
          id: source.id,
          text: source.text.substring(0, 100) + '...',
          similarity: source.similarity,
          tokens: source.tokens
        })),
        tokensUsed: result.data.tokensUsed,
        cost: result.data.cost,
        model: result.data.model
      } : null
    })

  } catch (error) {
    console.error('RAG test error:', error)
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
