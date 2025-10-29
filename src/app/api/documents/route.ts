import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/documents - Get user's documents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'processed';

    let query = supabase
      .from('documents')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    // Se status non è 'all', filtra per status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Get documents error:', error);
      return NextResponse.json({ error: 'Failed to get documents' }, { status: 500 });
    }

    return NextResponse.json({ documents: documents || [] });
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
