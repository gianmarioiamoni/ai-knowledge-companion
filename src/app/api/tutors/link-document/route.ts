import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { linkDocumentSchema } from '@/lib/schemas/tutors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Valida i dati di input
    const validationResult = linkDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { tutor_id, document_id } = validationResult.data;

    // Verifica autenticazione utente
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verifica che il tutor appartenga all'utente
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('id, owner_id')
      .eq('id', tutor_id)
      .eq('owner_id', user.id)
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json(
        { error: 'Tutor not found or access denied' },
        { status: 404 }
      );
    }

    // Verifica che il documento appartenga all'utente
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, owner_id, status')
      .eq('id', document_id)
      .eq('owner_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Verifica che il documento sia pronto per l'uso
    if (document.status !== 'ready') {
      return NextResponse.json(
        { error: 'Document is not ready for use. Please wait for processing to complete.' },
        { status: 400 }
      );
    }

    // Usa il service client per collegare il documento al tutor
    const serviceClient = createServiceClient();
    
    const { data: link, error: linkError } = await serviceClient
      .from('tutor_documents')
      .insert({
        tutor_id,
        document_id,
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error linking document to tutor:', linkError);
      return NextResponse.json(
        { error: linkError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('Link document API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
