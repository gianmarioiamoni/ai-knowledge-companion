import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Crea la funzione match_document_chunks
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION match_document_chunks(
        query_embedding vector(1536),
        match_threshold float DEFAULT 0.7,
        match_count int DEFAULT 10
      )
      RETURNS TABLE (
        id uuid,
        document_id uuid,
        chunk_index int,
        text text,
        tokens int,
        similarity float,
        created_at timestamptz
      )
      LANGUAGE SQL
      STABLE
      AS $$
        SELECT
          dc.id,
          dc.document_id,
          dc.chunk_index,
          dc.text,
          dc.tokens,
          1 - (dc.embedding <=> query_embedding) AS similarity,
          dc.created_at
        FROM document_chunks dc
        JOIN documents d ON dc.document_id = d.id
        WHERE dc.embedding IS NOT NULL
          AND 1 - (dc.embedding <=> query_embedding) > match_threshold
        ORDER BY dc.embedding <=> query_embedding
        LIMIT match_count;
      $$;
    `;
    
    console.log('Creating match_document_chunks function...');
    
    // Esegui la query usando il client Supabase
    const { error } = await supabase.rpc('exec', { sql: createFunctionQuery });
    
    if (error) {
      console.error('Error creating function:', error);
      return NextResponse.json(
        { error: `Failed to create function: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Crea la funzione match_document_chunks_filtered
    const createFilteredFunctionQuery = `
      CREATE OR REPLACE FUNCTION match_document_chunks_filtered(
        query_embedding vector(1536),
        document_ids uuid[] DEFAULT NULL,
        user_id uuid DEFAULT NULL,
        match_threshold float DEFAULT 0.7,
        match_count int DEFAULT 10
      )
      RETURNS TABLE (
        id uuid,
        document_id uuid,
        chunk_index int,
        text text,
        tokens int,
        similarity float,
        created_at timestamptz,
        document_title text,
        document_owner_id uuid
      )
      LANGUAGE SQL
      STABLE
      AS $$
        SELECT
          dc.id,
          dc.document_id,
          dc.chunk_index,
          dc.text,
          dc.tokens,
          1 - (dc.embedding <=> query_embedding) AS similarity,
          dc.created_at,
          d.title AS document_title,
          d.owner_id AS document_owner_id
        FROM document_chunks dc
        JOIN documents d ON dc.document_id = d.id
        WHERE dc.embedding IS NOT NULL
          AND 1 - (dc.embedding <=> query_embedding) > match_threshold
          AND (document_ids IS NULL OR dc.document_id = ANY(document_ids))
          AND (user_id IS NULL OR d.owner_id = user_id OR d.visibility = 'public')
        ORDER BY dc.embedding <=> query_embedding
        LIMIT match_count;
      $$;
    `;
    
    console.log('Creating match_document_chunks_filtered function...');
    
    const { error: error2 } = await supabase.rpc('exec', { sql: createFilteredFunctionQuery });
    
    if (error2) {
      console.error('Error creating filtered function:', error2);
      return NextResponse.json(
        { error: `Failed to create filtered function: ${error2.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully created similarity search functions',
      functionsCreated: ['match_document_chunks', 'match_document_chunks_filtered']
    });
    
  } catch (error) {
    console.error('Error applying similarity search schema:', error);
    return NextResponse.json(
      { error: 'Failed to apply similarity search schema' },
      { status: 500 }
    );
  }
}