import { NextRequest, NextResponse } from 'next/server'
import { withSuperAdmin } from '@/lib/middleware/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'
import { processDocumentBuffer } from '@/lib/workers/document-processor'

export const runtime = 'nodejs'

export const POST = withSuperAdmin(async (request: NextRequest, { roleInfo }) => {
  try {
    const { documentId } = await request.json()
    
    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    // Ottieni il documento
    const { data: document, error: docError } = await serviceClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Scarica il file dal bucket
    const { data: fileData, error: fileError } = await serviceClient.storage
      .from('documents')
      .download(document.file_path)

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    // Converte a Buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Processa il documento
    const result = await processDocumentBuffer(
      buffer, 
      document.title, 
      document.mime_type as any, 
      documentId, 
      {
        saveToDatabase: true,
        minTokens: 10,
        maxTokens: 200,
        overlapTokens: 20
      }, 
      serviceClient
    )

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Processing failed',
        success: false 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Document reprocessed successfully',
      data: {
        chunks: result.chunks?.length || 0,
        totalTokens: result.totalTokens,
        embeddingsGenerated: result.embeddingsGenerated
      }
    })

  } catch (error) {
    console.error('Reprocess document error:', error)
    return NextResponse.json({ 
      error: `Reprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
})
