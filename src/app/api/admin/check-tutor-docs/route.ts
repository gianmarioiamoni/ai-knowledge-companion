import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Ottieni tutti i tutor
    const { data: tutors } = await supabase
      .from('tutors')
      .select('id, name');
    
    // Ottieni tutti i tutor_documents
    const { data: tutorDocs } = await supabase
      .from('tutor_documents')
      .select('tutor_id, document_id');
    
    // Ottieni tutti i documenti
    const { data: documents } = await supabase
      .from('documents')
      .select('id, title');
    
    // Ottieni tutti i chunk
    const { data: chunks } = await supabase
      .from('document_chunks')
      .select('id, document_id, has_embedding:embedding.not.is.null');
    
    return NextResponse.json({
      success: true,
      data: {
        tutors: tutors || [],
        tutorDocuments: tutorDocs || [],
        documents: documents || [],
        chunks: chunks || []
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
