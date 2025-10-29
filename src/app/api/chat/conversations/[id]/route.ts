import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { updateConversationSchema } from '@/lib/schemas/chat';

// GET /api/chat/conversations/[id] - Get conversation
export async function GET(
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
    
    // Get conversation
    const { data: conversation, error } = await serviceClient
      .from('conversations')
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Get conversation error:', error);
      return NextResponse.json({ error: 'Failed to get conversation' }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get tutor information
    const { data: tutor, error: tutorError } = await serviceClient
      .from('tutors')
      .select('id, name, avatar_url, model')
      .eq('id', conversation.tutor_id)
      .single();

    if (tutorError) {
      console.error('Get tutor error:', tutorError);
      return NextResponse.json({ error: 'Failed to get tutor' }, { status: 500 });
    }

    const transformedConversation = {
      id: conversation.id,
      user_id: conversation.user_id,
      tutor_id: conversation.tutor_id,
      title: conversation.title,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      last_message_at: conversation.last_message_at,
      message_count: conversation.message_count,
      is_archived: conversation.is_archived,
      tutor_name: tutor?.name || 'Unknown Tutor',
      tutor_avatar_url: tutor?.avatar_url || null,
      tutor_model: tutor?.model || 'gpt-4',
    };

    return NextResponse.json({ conversation: transformedConversation });
  } catch (error) {
    console.error('Get conversation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/conversations/[id] - Update conversation
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

    const body = await request.json();
    const validation = updateConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const { data: conversation, error } = await serviceClient
      .from('conversations')
      .update(validation.data)
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
      console.error('Update conversation error:', error);
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Update conversation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/conversations/[id] - Delete conversation
export async function DELETE(
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
    const { error } = await serviceClient
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete conversation error:', error);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete conversation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
