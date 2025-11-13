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
        { error: 'Invalid input data', details: validationResult.error.issues },
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

    // Usa il service client per scollegare il documento dal tutor
    const serviceClient = createServiceClient();
    
    const { error: unlinkError } = await serviceClient
      .from('tutor_documents')
      .delete()
      .eq('tutor_id', tutor_id)
      .eq('document_id', document_id);

    if (unlinkError) {
      console.error('Error unlinking document from tutor:', unlinkError);
      return NextResponse.json(
        { error: unlinkError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlink document API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
