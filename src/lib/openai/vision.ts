/**
 * OpenAI Vision API Integration
 * Analyzes images using GPT-4 Vision to extract meaningful content
 */

import OpenAI from 'openai'
import type { SupabaseClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface VisionAnalysisOptions {
  detail?: 'low' | 'high' | 'auto'
  maxTokens?: number
  language?: string
}

export interface VisionAnalysisResult {
  text: string
  cost: number
  error?: string
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
}

/**
 * Analyze an image from a URL or base64 data
 */
export async function analyzeImage(
  imageUrl: string,
  options: VisionAnalysisOptions = {}
): Promise<VisionAnalysisResult> {
  try {
    const {
      detail = 'high',
      maxTokens = 1000,
      language = 'en'
    } = options

    // Create analysis prompt
    const prompt = language === 'it' 
      ? `Analizza questa immagine in dettaglio. Descrivi:
1. Il contenuto principale dell'immagine
2. Eventuali testi visibili (trascrivi completamente)
3. Elementi rilevanti per la comprensione
4. Contesto e significato

Fornisci una descrizione completa e strutturata che permetta di capire il contenuto senza vedere l'immagine.`
      : `Analyze this image in detail. Describe:
1. The main content of the image
2. Any visible text (transcribe completely)
3. Relevant elements for understanding
4. Context and meaning

Provide a complete and structured description that allows understanding the content without seeing the image.`

    console.log('🖼️  Analyzing image with GPT-4o Vision...')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: detail
              }
            }
          ]
        }
      ]
    })

    const analysisText = response.choices[0]?.message?.content || ''
    const usage = response.usage

    if (!analysisText) {
      return {
        text: '',
        cost: 0,
        error: 'No analysis text generated'
      }
    }

    // Calculate cost
    // GPT-4o Vision pricing:
    // - Input: $0.005 per 1K tokens (more affordable than GPT-4 Vision)
    // - Output: $0.015 per 1K tokens
    // - Image cost varies by detail level:
    //   - low: 85 tokens
    //   - high: 170 tokens per 512x512 tile
    const promptTokens = usage?.prompt_tokens || 0
    const completionTokens = usage?.completion_tokens || 0
    
    const inputCost = (promptTokens / 1000) * 0.005
    const outputCost = (completionTokens / 1000) * 0.015
    const totalCost = inputCost + outputCost

    console.log('✅ Vision analysis completed:', {
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens
      },
      cost: `$${totalCost.toFixed(4)}`
    })

    return {
      text: analysisText,
      cost: totalCost,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens
      }
    }
  } catch (error) {
    console.error('❌ Vision analysis error:', error)
    return {
      text: '',
      cost: 0,
      error: error instanceof Error ? error.message : 'Vision analysis failed'
    }
  }
}

/**
 * Analyze an image from Supabase Storage
 */
export async function analyzeImageFromStorage(
  supabase: SupabaseClient,
  bucketName: string,
  filePath: string,
  options: VisionAnalysisOptions = {}
): Promise<VisionAnalysisResult> {
  try {
    // Get public URL for the image (temporary)
    const { data: urlData } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (!urlData?.signedUrl) {
      return {
        text: '',
        cost: 0,
        error: 'Failed to get signed URL for image'
      }
    }

    console.log('📥 Got signed URL for image, analyzing...')

    return await analyzeImage(urlData.signedUrl, options)
  } catch (error) {
    console.error('❌ Storage image analysis error:', error)
    return {
      text: '',
      cost: 0,
      error: error instanceof Error ? error.message : 'Failed to analyze image from storage'
    }
  }
}

/**
 * Extract text from image using Vision API (OCR alternative)
 */
export async function extractTextFromImage(
  imageUrl: string,
  language: string = 'en'
): Promise<VisionAnalysisResult> {
  try {
    const prompt = language === 'it'
      ? 'Estrai e trascrivi TUTTO il testo presente in questa immagine. Mantieni la formattazione e la struttura originali. Se non c\'è testo, rispondi "Nessun testo trovato".'
      : 'Extract and transcribe ALL text present in this image. Maintain original formatting and structure. If there is no text, respond "No text found".'

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high' // High detail for better OCR
              }
            }
          ]
        }
      ]
    })

    const extractedText = response.choices[0]?.message?.content || ''
    const usage = response.usage

    const promptTokens = usage?.prompt_tokens || 0
    const completionTokens = usage?.completion_tokens || 0
    const totalCost = ((promptTokens / 1000) * 0.005) + ((completionTokens / 1000) * 0.015)

    return {
      text: extractedText,
      cost: totalCost,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens
      }
    }
  } catch (error) {
    console.error('❌ Text extraction error:', error)
    return {
      text: '',
      cost: 0,
      error: error instanceof Error ? error.message : 'Text extraction failed'
    }
  }
}

