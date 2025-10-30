import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { documentId, text } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceClient();
    
    // Ottieni il documento
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Simula il processing del documento
    // In un'implementazione reale, qui chiameresti il servizio di processing
    const seedText = (typeof text === 'string' && text.trim().length > 0)
      ? text.trim()
      : `${document.title ?? 'Document'} — ${document.description ?? ''}`.trim() || 'Sample text content';

    const chunks = [
      {
        document_id: documentId,
        chunk_index: 0,
        text: seedText,
        tokens: Math.max(10, seedText.length / 4),
        embedding: new Array(1536).fill(0.1) // Embedding di test
      }
    ];
    
    // Inserisci i chunk
    const { error: insertError } = await supabase
      .from('document_chunks')
      .insert(chunks);
    
    if (insertError) {
      return NextResponse.json(
        { error: `Failed to insert chunks: ${insertError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Document processed successfully',
      chunksCreated: chunks.length
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
