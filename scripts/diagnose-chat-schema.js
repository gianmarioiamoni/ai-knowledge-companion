const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseDatabase() {
  console.log('🔍 Diagnosing database schema...\n');

  try {
    // Check if conversations table exists
    console.log('1. Checking conversations table...');
    const { data: conversationsTable, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (conversationsError) {
      console.error('❌ Conversations table error:', conversationsError.message);
    } else {
      console.log('✅ Conversations table exists');
    }

    // Check if tutors table exists
    console.log('\n2. Checking tutors table...');
    const { data: tutorsTable, error: tutorsError } = await supabase
      .from('tutors')
      .select('*')
      .limit(1);
    
    if (tutorsError) {
      console.error('❌ Tutors table error:', tutorsError.message);
    } else {
      console.log('✅ Tutors table exists');
    }

    // Check table structure
    console.log('\n3. Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'conversations' });
    
    if (tableError) {
      console.log('ℹ️  Using alternative method to check structure...');
      // Try to describe the table structure by querying information_schema
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'conversations')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.error('❌ Could not get table structure:', columnsError.message);
      } else {
        console.log('📋 Conversations table columns:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      }
    }

    // Check foreign key relationships
    console.log('\n4. Checking foreign key relationships...');
    const { data: fkInfo, error: fkError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        constraint_type,
        table_name
      `)
      .eq('table_name', 'conversations')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (fkError) {
      console.error('❌ Could not get foreign key info:', fkError.message);
    } else {
      console.log('🔗 Foreign key constraints on conversations:');
      fkInfo.forEach(fk => {
        console.log(`   - ${fk.constraint_name}`);
      });
    }

    // Test a simple query with joins
    console.log('\n5. Testing join query...');
    const { data: joinTest, error: joinError } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        tutors!inner(
          id,
          name
        )
      `)
      .limit(1);
    
    if (joinError) {
      console.error('❌ Join query failed:', joinError.message);
    } else {
      console.log('✅ Join query successful');
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

diagnoseDatabase().then(() => {
  console.log('\n🏁 Diagnosis complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
