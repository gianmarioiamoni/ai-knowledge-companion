// Crea un piccolo test component per verificare le env vars
console.log('=== SUPABASE ENV VARS TEST ===');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'MISSING');
console.log('=============================');
