import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const serviceClient = createServiceClient();
    
    // Read the SQL schema file
    const sqlPath = path.join(process.cwd(), 'sql', '07_tutor_documents_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Applying ${statements.length} SQL statements...`);
    
    const results = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await serviceClient.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
          results.push({ statement: i + 1, success: false, error: error.message });
        } else {
          console.log(`   ✅ Statement ${i + 1} successful`);
          results.push({ statement: i + 1, success: true });
        }
      } catch (err) {
        console.error(`   ❌ Statement ${i + 1} error:`, err);
        results.push({ statement: i + 1, success: false, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`✅ Schema application completed: ${successCount} successful, ${failureCount} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Schema applied: ${successCount} successful, ${failureCount} failed`,
      results
    });
    
  } catch (error) {
    console.error('❌ Schema application error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
