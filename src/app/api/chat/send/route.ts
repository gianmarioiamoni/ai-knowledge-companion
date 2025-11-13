import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { chatRequestSchema } from '@/lib/schemas/chat';
import { queryTutorRAG } from '@/lib/openai/rag';
import { withRateLimit } from '@/lib/middleware/rate-limit-guard';
import { sanitize } from '@/lib/utils/log-sanitizer';

// POST /api/chat/send - Send message with RAG (with rate limiting and log sanitization)
export const POST = withRateLimit('ai', async (request: NextRequest, { roleInfo }) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { message, conversation_id, tutor_id } = validation.data;

    // Get tutor configuration
    const serviceClient = createServiceClient();
    const { data: tutor, error: tutorError } = await serviceClient
      .from('tutors')
      .select('*')
      .eq('id', tutor_id)
      .eq('owner_id', user.id)
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Save user message
    const { data: userMessage, error: userMessageError } = await serviceClient
      .from('messages')
      .insert({
        conversation_id,
        role: 'user',
        content: message,
        tokens_used: 0, // Will be updated after RAG response
        model: tutor.model,
        temperature: tutor.temperature,
      })
      .select('*')
      .single();

    if (userMessageError) {
      console.error('Save user message error:', sanitize(userMessageError));
      return NextResponse.json({ error: 'Failed to save user message' }, { status: 500 });
    }

    // Generate RAG response
    let ragResponse;
    let totalTokensUsed = 0;

    if (tutor.use_rag) {
      try {
        const ragResult = await queryTutorRAG(
          message,
          tutor_id,
          user.id,
          {
            maxChunks: tutor.max_context_chunks,
            similarityThreshold: tutor.similarity_threshold,
          }
        );

        if (ragResult.error) {
          throw new Error(ragResult.error.error);
        }

        ragResponse = {
          answer: ragResult.data?.answer || "I apologize, but I'm having trouble accessing my knowledge base right now.",
          sources: ragResult.data?.sources || [],
          tokens_used: ragResult.data?.tokensUsed || 0,
          model: tutor.model,
          temperature: tutor.temperature,
        };

        totalTokensUsed = ragResponse.tokens_used;
      } catch (ragError) {
        console.error('RAG generation error:', sanitize(ragError));
        // Fallback to simple response without RAG
        ragResponse = {
          answer: "I apologize, but I'm having trouble accessing my knowledge base right now. Please try again later.",
          sources: [],
          tokens_used: 0,
          model: tutor.model,
          temperature: tutor.temperature,
        };
      }
    } else {
      // Simple response without RAG
      ragResponse = {
        answer: "I'm a simple AI tutor without access to your documents. Please enable RAG in my settings to get contextual responses.",
        sources: [],
        tokens_used: 0,
        model: tutor.model,
        temperature: tutor.temperature,
      };
    }

    // Save assistant message
    const { data: assistantMessage, error: assistantMessageError } = await serviceClient
      .from('messages')
      .insert({
        conversation_id,
        role: 'assistant',
        content: ragResponse.answer,
        tokens_used: ragResponse.tokens_used,
        model: ragResponse.model,
        temperature: ragResponse.temperature,
        metadata: {
          rag_enabled: tutor.use_rag,
          sources_count: ragResponse.sources.length,
        },
      })
      .select('*')
      .single();

    if (assistantMessageError) {
      console.error('Save assistant message error:', sanitize(assistantMessageError));
      return NextResponse.json({ error: 'Failed to save assistant message' }, { status: 500 });
    }

    // Save RAG context if available
    if (ragResponse.sources && ragResponse.sources.length > 0) {
      const ragContextData = ragResponse.sources.map(source => ({
        message_id: assistantMessage.id,
        chunk_id: source.id,
        similarity_score: source.similarity || 0,
      }));

      const { error: ragContextError } = await serviceClient
        .from('message_rag_context')
        .insert(ragContextData);

      if (ragContextError) {
        console.error('Save RAG context error:', sanitize(ragContextError));
        // Don't fail the request for this error
      }
    }

    // Update user message with token count
    await serviceClient
      .from('messages')
      .update({ tokens_used: totalTokensUsed })
      .eq('id', userMessage.id);

    // Return the assistant message with RAG context
    const responseMessage = {
      ...assistantMessage,
      rag_chunks: ragResponse.sources || [],
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
      tokens_used: totalTokensUsed + ragResponse.tokens_used,
      model: ragResponse.model,
    });
  } catch (error) {
    console.error('Send message API error:', sanitize(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});