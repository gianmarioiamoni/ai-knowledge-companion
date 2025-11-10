/**
 * Multimedia Preview API Route
 * Serves preview/download for multimedia files (images, audio, video)
 */

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const supabase = createClient()

    // Get the multimedia document
    const { data: document, error: docError } = await supabase
      .from('multimedia_documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get the file from storage
    const { data: fileData, error: storageError } = await supabase
      .storage
      .from(document.media_type === 'audio' ? 'audio' : 'images')
      .download(document.file_path)

    if (storageError || !fileData) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { error: 'Failed to retrieve file' },
        { status: 500 }
      )
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer()

    // Return file with appropriate headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': document.mime_type,
        'Content-Length': document.file_size.toString(),
        'Content-Disposition': `inline; filename="${document.file_name}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving multimedia preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

