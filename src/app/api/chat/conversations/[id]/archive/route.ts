import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// PATCH /api/chat/conversations/[id]/archive - Archive conversation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: conversation, error } = await serviceClient
      .from('conversations')
      .update({ is_archived: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        id,
        user_id,
        tutor_id,
        title,
        created_at,
        updated_at,
        last_message_at,
        message_count,
        is_archived,
        metadata
      `)
      .single();

    if (error) {
      console.error('Archive conversation error:', error);
      return NextResponse.json({ error: 'Failed to archive conversation' }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Archive conversation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
