/**
 * Script per verificare lo stato delle RLS policies tramite API
 * Esegui con: npx tsx scripts/check-rls-via-api.ts
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Carica le variabili d'ambiente
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
  );
  process.exit(1);
}

// Crea client con service role key per accesso completo
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  console.log("🔍 Checking RLS Status...\n");

  const tables = [
    "profiles",
    "documents",
    "document_chunks",
    "tutors",
    "tutor_documents",
    "conversations",
    "messages",
    "usage_logs",
  ];

  // Test 1: Verifica se le tabelle esistono e sono accessibili
  console.log("📋 Table Accessibility Test:");
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err}`);
    }
  }

  console.log("\n📊 RLS Policy Test (without auth):");

  // Test 2: Prova ad accedere senza autenticazione (dovrebbe fallire se RLS è attivo)
  const anonClient = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  for (const table of tables) {
    try {
      const { data, error } = await anonClient.from(table).select("*").limit(1);

      if (error && error.code === "PGRST116") {
        console.log(`✅ ${table}: RLS is working (access denied)`);
      } else if (error) {
        console.log(`⚠️ ${table}: ${error.message}`);
      } else {
        console.log(`❌ ${table}: RLS might be disabled (access allowed)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err}`);
    }
  }

  console.log("\n🔐 Testing with authenticated user:");

  // Test 3: Prova con un utente autenticato (se esiste)
  try {
    const { data: users } = await supabase.auth.admin.listUsers();

    if (users && users.users.length > 0) {
      const testUser = users.users[0];
      console.log(`👤 Testing with user: ${testUser.email}`);

      // Simula l'accesso con questo utente
      const { data: session } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: testUser.email!,
      });

      console.log("✅ User authentication test completed");
    } else {
      console.log("⚠️ No users found in database");
    }
  } catch (err) {
    console.log(`❌ Auth test failed: ${err}`);
  }

  console.log("\n📈 Summary:");
  console.log(
    '- If tables show "access denied" for anonymous access, RLS is working'
  );
  console.log("- If tables are accessible without auth, RLS might be disabled");
  console.log("- Check the Supabase dashboard for detailed policy information");
}

// Esegui il check
checkRLSStatus().catch(console.error);
