export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { processDocumentBuffer } from '@/lib/workers/document-processor'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { withRateLimit } from '@/lib/middleware/rate-limit-guard'
import { sanitize } from '@/lib/utils/log-sanitizer'
import type { SupportedMimeType } from '@/types/documents'

export const POST = withRateLimit('ai', async (request: NextRequest, { roleInfo: _roleInfo }) => {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Verifica autenticazione
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ottieni il documento dal database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('owner_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Usa service client per operazioni che richiedono bypass RLS
    const serviceClient = createServiceClient()

    // Ottieni il file da Supabase Storage
    const { data: fileData, error: fileError } = await serviceClient.storage
      .from('documents')
      .download(document.storage_path)

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      )
    }

    // Converte a Buffer (Node runtime)
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Processa il documento (con embeddings)
    const result = await processDocumentBuffer(
      buffer, 
      document.title, 
      document.mime_type as SupportedMimeType, 
      documentId, 
      { saveToDatabase: true },
      serviceClient
    )

    if (result.success) {
      // Aggiorna lo stato del documento nel database
      const { error: updateError } = await serviceClient
        .from('documents')
        .update({
          status: 'ready',
          length_tokens: result.totalTokens || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (updateError) {
        console.error('Failed to update document status:', sanitize(updateError))
      }

      return NextResponse.json({
        success: true,
        documentId: result.documentId,
        chunks: result.chunks?.length || 0,
        totalTokens: result.totalTokens,
        embeddingsGenerated: result.embeddingsGenerated,
        embeddingCost: result.embeddingCost
      })
    } else {
      // Aggiorna lo stato del documento come errore
      await serviceClient
        .from('documents')
        .update({
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Document processing API error:', sanitize(error))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
});
