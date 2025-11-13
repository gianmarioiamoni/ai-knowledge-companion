import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tutors/list - Get user's tutors for testing
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: tutors, error } = await supabase
      .from('tutors')
      .select('id, name, description, model')
      .eq('owner_id', user.id);

    if (error) {
      console.error('Get tutors error:', error);
      return NextResponse.json({ error: 'Failed to get tutors' }, { status: 500 });
    }

    return NextResponse.json({ tutors: tutors || [] });
  } catch (error) {
    console.error('Tutors list API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
