import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Read and execute SQL script
    const sqlPath = path.join(process.cwd(), 'sql', '08_update_bucket_for_pptx.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct update
      const { error: updateError } = await supabase
        .from('storage.buckets')
        .update({
          allowed_mime_types: [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          ]
        })
        .eq('id', 'documents');

      if (updateError) {
        console.error('Direct update failed:', updateError);
        return NextResponse.json(
          { 
            error: 'Failed to update bucket',
            details: updateError.message,
            suggestion: 'Please run the SQL script manually in Supabase SQL Editor'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Storage bucket updated to support PPTX files',
      allowed_mime_types: [
        'application/pdf',
        'text/plain',
        'text/markdown',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
    });
  } catch (error) {
    console.error('Error updating bucket:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update bucket',
        details: error instanceof Error ? error.message : 'Unknown error',
        sql_file: 'sql/08_update_bucket_for_pptx.sql'
      },
      { status: 500 }
    );
  }
}

