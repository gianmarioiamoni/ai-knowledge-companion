const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function applyChatSchemaFix() {
  console.log('🔧 Applying chat schema fix...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', '06_fix_chat_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing SQL schema fix...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ SQL execution failed:', error.message);
      
      // Try alternative method - execute SQL directly
      console.log('🔄 Trying alternative method...');
      
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (stmtError) {
              console.warn(`   ⚠️  Statement ${i + 1} failed:`, stmtError.message);
            } else {
              console.log(`   ✅ Statement ${i + 1} executed successfully`);
            }
          } catch (err) {
            console.warn(`   ⚠️  Statement ${i + 1} error:`, err.message);
          }
        }
      }
    } else {
      console.log('✅ SQL schema fix applied successfully');
    }

    // Test the fix
    console.log('\n🧪 Testing the fix...');
    
    // Test conversations table
    const { data: conversationsTest, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (conversationsError) {
      console.error('❌ Conversations table test failed:', conversationsError.message);
    } else {
      console.log('✅ Conversations table accessible');
    }

    // Test tutors table
    const { data: tutorsTest, error: tutorsError } = await supabase
      .from('tutors')
      .select('*')
      .limit(1);
    
    if (tutorsError) {
      console.error('❌ Tutors table test failed:', tutorsError.message);
    } else {
      console.log('✅ Tutors table accessible');
    }

    // Test join query
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
      console.error('❌ Join query test failed:', joinError.message);
    } else {
      console.log('✅ Join query successful - relationship established');
    }

    console.log('\n🎉 Chat schema fix completed!');
    console.log('You can now test the chat functionality.');

  } catch (error) {
    console.error('❌ Fatal error applying schema fix:', error.message);
    console.error('\nPlease manually apply the SQL file: sql/06_fix_chat_schema.sql');
    console.error('You can copy and paste it into your Supabase SQL editor.');
  }
}

applyChatSchemaFix().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
