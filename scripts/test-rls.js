/**
 * Test rapido per verificare se le RLS policies funzionano
 * Esegui con: node scripts/test-rls.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
}

// Client anonimo (senza autenticazione)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRLS() {
    console.log('🔒 Testing RLS Policies...\n')

    const tables = ['documents', 'profiles', 'tutors']

    for (const table of tables) {
        try {
            console.log(`Testing ${table}...`)

            // Prova a leggere senza autenticazione
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1)

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('RLS')) {
                    console.log(`✅ ${table}: RLS is working (${error.message})`)
                } else {
                    console.log(`⚠️ ${table}: Unexpected error - ${error.message}`)
                }
            } else {
                console.log(`❌ ${table}: RLS might be disabled - data accessible without auth`)
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`)
        }
    }

    console.log('\n📊 Summary:')
    console.log('✅ = RLS is working correctly')
    console.log('❌ = RLS might be disabled')
    console.log('⚠️ = Check manually')
}

testRLS().catch(console.error)
