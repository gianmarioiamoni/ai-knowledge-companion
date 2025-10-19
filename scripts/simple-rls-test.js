/**
 * Test semplificato per RLS (senza dipendenze esterne)
 * Esegui con: node scripts/simple-rls-test.js
 * 
 * IMPORTANTE: Sostituisci le variabili qui sotto con i tuoi valori da .env.local
 */

const { createClient } = require('@supabase/supabase-js')

// ⚠️ SOSTITUISCI QUESTI VALORI CON I TUOI DA .env.local
const SUPABASE_URL = 'your_supabase_url_here'
const SUPABASE_ANON_KEY = 'your_supabase_anon_key_here'

if (SUPABASE_URL === 'your_supabase_url_here' || SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
    console.log('❌ Please update the SUPABASE_URL and SUPABASE_ANON_KEY in this script')
    console.log('📝 Copy the values from your .env.local file')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testRLS() {
    console.log('🔒 Testing RLS Policies (Anonymous Access)...\n')

    const tables = [
        { name: 'documents', expected: 'blocked' },
        { name: 'profiles', expected: 'blocked' },
        { name: 'tutors', expected: 'blocked' }
    ]

    for (const table of tables) {
        try {
            console.log(`Testing ${table.name}...`)

            const { data, error } = await supabase
                .from(table.name)
                .select('*')
                .limit(1)

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('RLS') || error.message.includes('policy')) {
                    console.log(`✅ ${table.name}: RLS is working - ${error.message}`)
                } else {
                    console.log(`⚠️ ${table.name}: Other error - ${error.message}`)
                }
            } else {
                console.log(`❌ ${table.name}: RLS might be disabled - got ${data?.length || 0} rows`)
            }
        } catch (err) {
            console.log(`❌ ${table.name}: Exception - ${err.message}`)
        }
    }

    console.log('\n📊 Results Summary:')
    console.log('✅ = RLS is working (access blocked)')
    console.log('❌ = RLS might be disabled (access allowed)')
    console.log('⚠️ = Manual check needed')
    console.log('\n💡 If you see "RLS is working" for all tables, your security is properly configured!')
}

testRLS().catch(console.error)
