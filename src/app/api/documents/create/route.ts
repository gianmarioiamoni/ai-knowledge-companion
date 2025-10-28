import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { title, description, mimeType, fileSize, storagePath } = await request.json()

    if (!title || !mimeType || !storagePath) {
      return NextResponse.json(
        { error: 'Title, mimeType, and storagePath are required' },
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

    // Usa service client per creare il documento (bypassa RLS)
    const serviceClient = createServiceClient()

    const documentData = {
      owner_id: user.id,
      title,
      description: description || null,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size: fileSize || null,
      status: 'processing' as const,
      visibility: 'private' as const,
    }

    const { data, error: createError } = await serviceClient
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (createError) {
      console.error('Create document error:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: data
    })
  } catch (error) {
    console.error('Create document API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
