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
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    
    // Get messages
    const { data: messages, error } = await serviceClient
      .from('messages')
      .select(`
        id,
        role,
        content,
        tokens_used,
        model,
        temperature,
        created_at,
        metadata
      `)
      .eq('conversation_id', validation.data.conversation_id)
      .order('created_at', { ascending: true })
      .range(validation.data.offset, validation.data.offset + validation.data.limit - 1);

    if (error) {
      console.error('Get messages error:', error);
      return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
    }

    // Get RAG context for each message
    type RAGChunk = {
      chunk_id: string;
      similarity_score: number;
      content: string;
      document_name: string;
    };
    type RAGItem = {
      message_id: string;
      similarity_score: number;
      document_chunks: {
        id: string;
        content: string;
        documents: {
          name: string;
        };
      };
    };
    
    const messageIds = messages?.map(msg => msg.id) || [];
    let ragContext: Record<string, RAGChunk[]> = {};
    
    if (messageIds.length > 0) {
      const { data: ragData, error: ragError } = await serviceClient
        .from('message_rag_context')
        .select(`
          message_id,
          similarity_score,
          document_chunks!inner(
            id,
            content,
            documents!inner(
              name
            )
          )
        `)
        .in('message_id', messageIds);
      
      if (!ragError && ragData) {
        ragContext = (ragData as unknown as RAGItem[]).reduce((acc, item) => {
          if (!acc[item.message_id]) {
            acc[item.message_id] = [];
          }
          acc[item.message_id].push({
            chunk_id: item.document_chunks.id,
            similarity_score: item.similarity_score,
            content: item.document_chunks.content,
            document_name: item.document_chunks.documents.name,
          });
          return acc;
        }, {} as Record<string, RAGChunk[]>);
      }
    }

    const transformedMessages = messages?.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      tokens_used: msg.tokens_used,
      model: msg.model,
      rag_chunks: ragContext[msg.id] || [],
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
