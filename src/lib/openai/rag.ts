import OpenAI from 'openai'
import { searchSimilarChunks, searchTutorChunks, type SimilarityResult } from '@/lib/supabase/similarity-search'
import { logUsage } from '@/lib/supabase/billing'
import type { QuotaCheckResult } from '@/types/billing'

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

export interface RAGQuery {
  question: string
  context?: string
  tutorId?: string
  userId?: string
  maxChunks?: number
  similarityThreshold?: number
}

export interface RAGResponse {
  answer: string
  sources: SimilarityResult[]
  tokensUsed: number
  cost: number
  model: string
}

export interface RAGError {
  error: string
  code: string
}

/**
 * Esegue una query RAG completa: retrieval + generation
 */
export async function queryRAG(
  query: RAGQuery
): Promise<{ data?: RAGResponse; error?: RAGError }> {
  try {
    const {
      question,
      context = '',
      tutorId,
      userId,
      maxChunks = 10,
      similarityThreshold = 0.1
    } = query

    // Step 1: Retrieval - Cerca chunk simili
    console.log(`🔍 Searching for similar chunks for: "${question}"`)
    console.log(`📊 Search params: tutorId=${tutorId}, maxChunks=${maxChunks}, threshold=${similarityThreshold}`)
    
    const searchResult = tutorId 
      ? await searchTutorChunks(question, tutorId, {
          limit: maxChunks,
          threshold: similarityThreshold,
          userId
        })
      : await searchSimilarChunks(question, {
          limit: maxChunks,
          threshold: similarityThreshold,
          userId
        })

    console.log(`📋 Search result:`, {
      hasData: !!searchResult.data,
      dataLength: searchResult.data?.length || 0,
      error: searchResult.error
    })

    if (searchResult.error) {
      return {
        error: {
          error: `Retrieval failed: ${searchResult.error}`,
          code: 'RETRIEVAL_ERROR'
        }
      }
    }

    if (!searchResult.data || searchResult.data.length === 0) {
      return {
        data: {
          answer: "I couldn't find any relevant information to answer your question. Please try rephrasing your question or upload more documents.",
          sources: [],
          tokensUsed: 0,
          cost: 0,
          model: 'gpt-4'
        }
      }
    }

    // Step 2: Preparazione del contesto
    const contextText = searchResult.data
      .map((chunk, index) => `[Source ${index + 1}]: ${chunk.text}`)
      .join('\n\n')

    const systemPrompt = `You are an AI tutor that answers questions based on the provided context. 
    
Instructions:
- Answer the user's question using ONLY the information provided in the context
- If the context doesn't contain enough information, say so clearly
- Cite sources when possible using [Source X] format
- Be helpful, accurate, and educational
- If asked about something not in the context, explain that you don't have that information
- Keep answers concise but comprehensive

Context:
${contextText}

${context ? `Additional context: ${context}` : ''}`

    // Step 3: Generation - Genera risposta con OpenAI
    console.log(`🤖 Generating answer with OpenAI...`)
    
    const openai = getOpenAIClient()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })

    const answer = completion.choices[0]?.message?.content || 'No answer generated'
    const tokensUsed = completion.usage?.total_tokens || 0
    const cost = estimateCompletionCost(tokensUsed, 'gpt-4')

    console.log(`✅ RAG query completed: ${tokensUsed} tokens, $${cost.toFixed(4)} cost`)

    // Log usage for billing tracking
    if (userId) {
      const usageResult = await logUsage({
        user_id: userId,
        tutor_id: tutorId || null,
        action: 'completion',
        api_calls: 1,
        tokens_used: tokensUsed,
        cost_estimate: cost,
        metadata: {
          model: 'gpt-4',
          chunks_retrieved: searchResult.data.length,
          question_length: question.length
        }
      })

      if (usageResult.error) {
        console.error('Failed to log usage:', usageResult.error)
      } else if (usageResult.data) {
        const quotaData: QuotaCheckResult = usageResult.data
        console.log(`📊 Usage logged. Quota: ${quotaData.current_value || 'N/A'}/${quotaData.max_value || 'N/A'}`)
        
        // Check if quota exceeded
        if (quotaData.quota_exceeded) {
          console.warn(`⚠️  User ${userId} has exceeded their ${quotaData.exceeded_type} quota!`)
        }
      }
    }

    return {
      data: {
        answer,
        sources: searchResult.data,
        tokensUsed,
        cost,
        model: 'gpt-4'
      }
    }
  } catch (error) {
    console.error('RAG query error:', error)
    return {
      error: {
        error: `RAG query failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        code: 'RAG_QUERY_ERROR'
      }
    }
  }
}

/**
 * Esegue una query RAG per un tutor specifico
 */
export async function queryTutorRAG(
  question: string,
  tutorId: string,
  userId?: string,
  options: Partial<RAGQuery> = {}
): Promise<{ data?: RAGResponse; error?: RAGError }> {
  return queryRAG({
    question,
    tutorId,
    userId,
    ...options
  })
}

/**
 * Stima il costo di una completion OpenAI
 */
function estimateCompletionCost(
  tokens: number,
  model: string = 'gpt-4'
): number {
  // Prezzi per 1K token (dati OpenAI aggiornati)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 }, // $0.03 input, $0.06 output per 1K token
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 }, // $0.001 input, $0.002 output per 1K token
  }

  const modelPricing = pricing[model] || pricing['gpt-4']
  // Assumiamo 70% input, 30% output per stima
  const inputTokens = Math.floor(tokens * 0.7)
  const outputTokens = Math.floor(tokens * 0.3)
  
  return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output
}

/**
 * Valida una query RAG
 */
export function validateRAGQuery(query: RAGQuery): { valid: boolean; error?: string } {
  if (!query.question || query.question.trim().length === 0) {
    return {
      valid: false,
      error: 'Question cannot be empty'
    }
  }

  if (query.question.length > 1000) {
    return {
      valid: false,
      error: 'Question too long (max 1000 characters)'
    }
  }

  if (query.maxChunks && (query.maxChunks < 1 || query.maxChunks > 20)) {
    return {
      valid: false,
      error: 'Max chunks must be between 1 and 20'
    }
  }

  if (query.similarityThreshold && (query.similarityThreshold < 0 || query.similarityThreshold > 1)) {
    return {
      valid: false,
      error: 'Similarity threshold must be between 0 and 1'
    }
  }

  return { valid: true }
}
