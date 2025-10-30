import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Conta i documenti
    const { count: docCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    // Conta i chunk
    const { count: chunkCount } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true });
    
    // Conta i chunk con embeddings
    const { count: embeddingCount } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);
    
    // Ottieni alcuni esempi
    const { data: sampleChunks } = await supabase
      .from('document_chunks')
      .select('id, document_id, has_embedding:embedding.not.is.null')
      .limit(5);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalDocuments: docCount || 0,
        totalChunks: chunkCount || 0,
        chunksWithEmbeddings: embeddingCount || 0,
        sampleChunks: sampleChunks || []
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
