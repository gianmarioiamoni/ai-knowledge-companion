import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { messageQuerySchema } from '@/lib/schemas/chat';

// GET /api/chat/messages - Get messages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      conversation_id: searchParams.get('conversation_id') || '',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validation = messageQuerySchema.safeParse(query);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const { data: messages, error } = await serviceClient
      .rpc('get_messages_with_context', { conversation_uuid: validation.data.conversation_id });

    if (error) {
      console.error('Get messages error:', error);
      return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
    }

    const transformedMessages = messages?.map(msg => ({
      id: msg.message_id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      tokens_used: msg.tokens_used,
      model: msg.model,
      rag_chunks: msg.rag_chunks || [],
    })) || [];

    return NextResponse.json({ messages: transformedMessages });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
