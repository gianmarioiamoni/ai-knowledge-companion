/**
 * Multimedia Preview API Route
 * Serves preview/download for multimedia files (images, audio, video)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBucketForMediaType } from '@/lib/supabase/multimedia'
import type { MediaType } from '@/types/multimedia'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Unauthorized preview attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    console.log(`📥 Preview request for multimedia: ${id} by user: ${user.id}`)

    // Get the multimedia document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path, media_type, mime_type, file_size, title')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (docError || !document) {
      console.error('❌ Document not found:', docError)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Type assertion for document
    const doc = document as {
      storage_path: string
      media_type: string
      mime_type: string
      file_size: number
      title: string
    }

    console.log(`📁 Document found:`, {
      id,
      storage_path: doc.storage_path,
      media_type: doc.media_type,
    })

    // Get the appropriate storage bucket
    const bucket = getBucketForMediaType(doc.media_type as MediaType)
    console.log(`🗂️  Using bucket: ${bucket}`)

    // Get the file from storage
    const { data: fileData, error: storageError } = await supabase
      .storage
      .from(bucket)
      .download(doc.storage_path)

    if (storageError || !fileData) {
      console.error('❌ Storage error:', storageError)
      return NextResponse.json(
        { error: 'Failed to retrieve file' },
        { status: 500 }
      )
    }

    console.log('✅ File retrieved successfully')

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer()

    // Return file with appropriate headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': doc.mime_type,
        'Content-Length': doc.file_size.toString(),
        'Content-Disposition': `inline; filename="${doc.title}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('❌ Error serving multimedia preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

