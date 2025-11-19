// @ts-nocheck
/**
 * Seed Data Orchestrator
 * 
 * Main script to populate the database with realistic demo data:
 * 1. Upload and process documents (with embeddings)
 * 2. Create tutors and link documents
 * 3. Create demo conversations
 * 
 * Usage:
 *   tsx scripts/seed/index.ts [userEmail]
 *   
 * Environment variables required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_APP_URL (or defaults to http://localhost:3000)
 *   - OPENAI_API_KEY (for embeddings)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

import { TARGET_USER_EMAIL } from './seed-config';
import { uploadAllDocuments } from './upload-documents';
import { createAllTutors } from './create-tutors';
import { createAllConversations } from './create-demo-chats';

interface SeedSummary {
  success: boolean;
  userId: string;
  userEmail: string;
  documentsUploaded: number;
  documentsFailed: number;
  tutorsCreated: number;
  tutorsFailed: number;
  conversationsCreated: number;
  conversationsFailed: number;
  totalMessages: number;
  estimatedCost: number;
  duration: number;
  errors: string[];
}

/**
 * Estimate OpenAI API cost
 */
function estimateCost(documentCount: number): number {
  // Rough estimate:
  // - Average document: ~3000 tokens
  // - Chunking: ~10 chunks per document
  // - Embeddings: $0.0001 per 1000 tokens
  // - Processing: ~30,000 tokens per document
  const tokensPerDoc = 30000;
  const costPer1kTokens = 0.0001;
  return (documentCount * tokensPerDoc * costPer1kTokens);
}

/**
 * Main seed function
 */
async function seed(): Promise<SeedSummary> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     AI Knowledge Companion - Seed Data Script     ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // Get user email
  const userEmail = process.argv[2] || TARGET_USER_EMAIL;
  
  if (!userEmail) {
    throw new Error('User email not provided. Usage: tsx scripts/seed/index.ts user@example.com');
  }

  console.log(`📧 Target User: ${userEmail}`);
  console.log(`📅 Date: ${new Date().toLocaleString()}\n`);

  // Verify environment variables
  console.log('🔍 Checking environment variables...\n');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
    console.log(`  ✅ ${envVar}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log(`  ℹ️  NEXT_PUBLIC_APP_URL: ${appUrl}`);

  console.log('\n─────────────────────────────────────────────────────\n');

  // Step 1: Upload and process documents
  console.log('📚 STEP 1: Upload and Process Documents');
  console.log('─────────────────────────────────────────────────────');
  
  const { userId, results: docResults, documentMap } = await uploadAllDocuments(userEmail);
  
  const documentsUploaded = docResults.filter(r => r.success).length;
  const documentsFailed = docResults.filter(r => !r.success).length;

  if (documentsFailed > 0) {
    docResults
      .filter(r => !r.success)
      .forEach(r => errors.push(`Document: ${r.title} - ${r.error}`));
  }

  console.log('\n─────────────────────────────────────────────────────\n');

  // Step 2: Create tutors and link documents
  console.log('🤖 STEP 2: Create Tutors and Link Documents');
  console.log('─────────────────────────────────────────────────────');
  
  const { results: tutorResults, tutorMap } = await createAllTutors(userId, documentMap);
  
  const tutorsCreated = tutorResults.filter(r => r.success).length;
  const tutorsFailed = tutorResults.filter(r => !r.success).length;

  if (tutorsFailed > 0) {
    tutorResults
      .filter(r => !r.success)
      .forEach(r => errors.push(`Tutor: ${r.tutorName} - ${r.error}`));
  }

  console.log('\n─────────────────────────────────────────────────────\n');

  // Step 3: Create demo conversations
  console.log('💬 STEP 3: Create Demo Conversations');
  console.log('─────────────────────────────────────────────────────');
  
  const { results: convResults } = await createAllConversations(userId, tutorMap);
  
  const conversationsCreated = convResults.filter(r => r.success).length;
  const conversationsFailed = convResults.filter(r => !r.success).length;
  const totalMessages = convResults.reduce((sum, r) => sum + (r.messageCount || 0), 0);

  if (conversationsFailed > 0) {
    convResults
      .filter(r => !r.success)
      .forEach(r => errors.push(`Conversation: ${r.title} - ${r.error}`));
  }

  console.log('\n─────────────────────────────────────────────────────\n');

  // Final summary
  const duration = Math.round((Date.now() - startTime) / 1000);
  const estimatedCost = estimateCost(documentsUploaded);
  const success = documentsFailed === 0 && tutorsFailed === 0 && conversationsFailed === 0;

  const summary: SeedSummary = {
    success,
    userId,
    userEmail,
    documentsUploaded,
    documentsFailed,
    tutorsCreated,
    tutorsFailed,
    conversationsCreated,
    conversationsFailed,
    totalMessages,
    estimatedCost,
    duration,
    errors
  };

  return summary;
}

/**
 * Print final summary
 */
function printSummary(summary: SeedSummary): void {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║              SEED DATA SUMMARY                     ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log(`👤 User: ${summary.userEmail}`);
  console.log(`🆔 User ID: ${summary.userId}\n`);

  console.log('📊 Results:');
  console.log(`  📄 Documents: ${summary.documentsUploaded} uploaded, ${summary.documentsFailed} failed`);
  console.log(`  🤖 Tutors: ${summary.tutorsCreated} created, ${summary.tutorsFailed} failed`);
  console.log(`  💬 Conversations: ${summary.conversationsCreated} created, ${summary.conversationsFailed} failed`);
  console.log(`  ✉️  Messages: ${summary.totalMessages} total\n`);

  console.log(`💰 Estimated OpenAI Cost: ~$${summary.estimatedCost.toFixed(2)}`);
  console.log(`⏱️  Duration: ${summary.duration}s (${Math.round(summary.duration / 60)}m ${summary.duration % 60}s)\n`);

  if (summary.errors.length > 0) {
    console.log('❌ Errors encountered:');
    summary.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    console.log();
  }

  if (summary.success) {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║              ✅ SEED COMPLETED SUCCESSFULLY!       ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log('🎉 Next steps:');
    console.log(`  1. Login as: ${summary.userEmail}`);
    console.log('  2. Navigate to "My Tutors" to see the created tutors');
    console.log('  3. Navigate to "Documents" to see uploaded files');
    console.log('  4. Navigate to "Chat" to see demo conversations');
    console.log('  5. Test the RAG functionality by asking questions!\n');
  } else {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║         ⚠️  SEED COMPLETED WITH ERRORS            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    const summary = await seed();
    printSummary(summary);
    
    process.exit(summary.success ? 0 : 1);
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════╗');
    console.error('║                ❌ FATAL ERROR                     ║');
    console.error('╚════════════════════════════════════════════════════╝\n');
    console.error(error);
    console.error();
    process.exit(1);
  }
}

// Run
main();

