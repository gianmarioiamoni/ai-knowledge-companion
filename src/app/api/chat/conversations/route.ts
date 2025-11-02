import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createConversationSchema, conversationQuerySchema } from '@/lib/schemas/chat';

// GET /api/chat/conversations - Get conversations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      tutor_id: searchParams.get('tutor_id') || undefined,
      archived: searchParams.get('archived') === 'true' ? true : undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validation = conversationQuerySchema.safeParse(query);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    
    // Use explicit join instead of Supabase relationship
    let query_builder = serviceClient
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        last_message_at,
        message_count,
        is_archived,
        tutor_id
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(validation.data.offset, validation.data.offset + validation.data.limit - 1);

    if (validation.data.tutor_id) {
      query_builder = query_builder.eq('tutor_id', validation.data.tutor_id);
    }

    if (validation.data.archived !== undefined) {
      query_builder = query_builder.eq('is_archived', validation.data.archived);
    }

    const { data: conversations, error } = await query_builder;

    if (error) {
      console.error('Get conversations error:', error);
      return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 });
    }

    // Get tutor information separately
    const tutorIds = [...new Set(conversations?.map(conv => conv.tutor_id) || [])];
    let tutors = {};
    
    if (tutorIds.length > 0) {
      const { data: tutorsData, error: tutorsError } = await serviceClient
        .from('tutors')
        .select('id, name, avatar_url, model')
        .in('id', tutorIds);
      
      if (tutorsError) {
        console.error('Get tutors error:', tutorsError);
        return NextResponse.json({ error: 'Failed to get tutors' }, { status: 500 });
      }
      
      tutors = tutorsData?.reduce((acc, tutor) => {
        acc[tutor.id] = tutor;
        return acc;
      }, {} as Record<string, any>) || {};
    }

    const transformedConversations = conversations?.map(conv => {
      const tutor = tutors[conv.tutor_id] || {
        id: conv.tutor_id,
        name: 'Unknown Tutor',
        avatar_url: null,
        model: 'gpt-4',
      };
      
      return {
        id: conv.id,
        title: conv.title,
        tutor: tutor,
        last_message_at: conv.last_message_at,
        message_count: conv.message_count,
        is_archived: conv.is_archived,
      };
    }) || [];

    return NextResponse.json({ conversations: transformedConversations });
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/chat/conversations - Create conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/chat/conversations - Received body:', body);
    
    // Manual validation as workaround for Zod bundling issue
    if (!body.tutor_id || typeof body.tutor_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input data: tutor_id is required' },
        { status: 400 }
      );
    }

    const conversationData = {
      user_id: user.id,
      tutor_id: body.tutor_id,
      title: body.title || 'New Conversation',
      metadata: body.metadata || {},
    };

    const serviceClient = createServiceClient();
    const { data: conversation, error } = await serviceClient
      .from('conversations')
      .insert(conversationData)
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
      console.error('Create conversation error:', error);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Create conversation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
