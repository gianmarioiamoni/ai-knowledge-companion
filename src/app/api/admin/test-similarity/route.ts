import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Testa se la funzione esiste
    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: new Array(1536).fill(0.1), // Embedding di test
      match_threshold: 0.1,
      match_count: 1
    });
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        functionExists: false
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Function exists and works',
      functionExists: true,
      results: data?.length || 0
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      functionExists: false
    });
  }
}
