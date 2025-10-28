import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createTutorSchema } from '@/lib/schemas/tutors';
import { DEFAULT_TUTOR_CONFIG } from '@/types/tutors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API received data:', body);
    
    // Valida i dati di input
    const validationResult = createTutorSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validationResult.error.errors,
          receivedData: body
        },
        { status: 400 }
      );
    }

    const tutorData = validationResult.data;

    // Verifica autenticazione utente
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Usa il service client per creare il tutor (bypass RLS)
    const serviceClient = createServiceClient();
    
    // Genera share_token se il tutor è condivisibile
    const shareToken = tutorData.visibility === 'unlisted' ? 
      generateShareToken() : null;

    const { data: tutor, error: createError } = await serviceClient
      .from('tutors')
      .insert({
        owner_id: user.id,
        name: tutorData.name,
        description: tutorData.description,
        avatar_url: tutorData.avatar_url,
        system_prompt: tutorData.system_prompt || DEFAULT_TUTOR_CONFIG.system_prompt,
        temperature: tutorData.temperature || DEFAULT_TUTOR_CONFIG.temperature,
        max_tokens: tutorData.max_tokens || DEFAULT_TUTOR_CONFIG.max_tokens,
        model: tutorData.model || DEFAULT_TUTOR_CONFIG.model,
        use_rag: tutorData.use_rag ?? DEFAULT_TUTOR_CONFIG.use_rag,
        max_context_chunks: tutorData.max_context_chunks || DEFAULT_TUTOR_CONFIG.max_context_chunks,
        similarity_threshold: tutorData.similarity_threshold || DEFAULT_TUTOR_CONFIG.similarity_threshold,
        allowed_document_types: tutorData.allowed_document_types || DEFAULT_TUTOR_CONFIG.allowed_document_types,
        max_document_size_mb: tutorData.max_document_size_mb || DEFAULT_TUTOR_CONFIG.max_document_size_mb,
        visibility: tutorData.visibility || DEFAULT_TUTOR_CONFIG.visibility,
        is_shared: tutorData.visibility === 'public' || tutorData.visibility === 'unlisted',
        share_token: shareToken,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating tutor:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tutor }, { status: 201 });
  } catch (error) {
    console.error('Tutor creation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateShareToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
