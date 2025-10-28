import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { updateTutorSchema } from '@/lib/schemas/tutors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tutorId = params.id;
    const body = await request.json();
    
    // Valida i dati di input
    const validationResult = updateTutorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

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
    const { data: existingTutor, error: fetchError } = await supabase
      .from('tutors')
      .select('id, owner_id')
      .eq('id', tutorId)
      .eq('owner_id', user.id)
      .single();

    if (fetchError || !existingTutor) {
      return NextResponse.json(
        { error: 'Tutor not found or access denied' },
        { status: 404 }
      );
    }

    // Usa il service client per aggiornare il tutor
    const serviceClient = createServiceClient();
    
    // Genera nuovo share_token se necessario
    const updateData: any = { ...updates };
    if (updates.visibility === 'unlisted' && !updates.is_shared) {
      updateData.share_token = generateShareToken();
    } else if (updates.visibility === 'private') {
      updateData.share_token = null;
    }

    const { data: tutor, error: updateError } = await serviceClient
      .from('tutors')
      .update(updateData)
      .eq('id', tutorId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating tutor:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tutor });
  } catch (error) {
    console.error('Tutor update API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tutorId = params.id;

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
    const { data: existingTutor, error: fetchError } = await supabase
      .from('tutors')
      .select('id, owner_id')
      .eq('id', tutorId)
      .eq('owner_id', user.id)
      .single();

    if (fetchError || !existingTutor) {
      return NextResponse.json(
        { error: 'Tutor not found or access denied' },
        { status: 404 }
      );
    }

    // Usa il service client per eliminare il tutor
    const serviceClient = createServiceClient();
    
    const { error: deleteError } = await serviceClient
      .from('tutors')
      .delete()
      .eq('id', tutorId);

    if (deleteError) {
      console.error('Error deleting tutor:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tutor deletion API error:', error);
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
