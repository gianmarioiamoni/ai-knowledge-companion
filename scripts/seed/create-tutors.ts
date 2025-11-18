/**
 * Create Tutors and Link Documents
 * 
 * Creates seed tutors and links them to uploaded documents
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SEED_TUTORS, type SeedTutor } from './seed-config';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

interface CreateTutorResult {
  success: boolean;
  tutorId?: string;
  tutorName: string;
  error?: string;
  linkedDocuments?: number;
}

/**
 * Create a single tutor
 */
async function createTutor(
  userId: string,
  tutor: SeedTutor,
  documentMap: Map<string, string>
): Promise<CreateTutorResult> {
  const result: CreateTutorResult = {
    success: false,
    tutorName: tutor.name
  };

  try {
    console.log(`🤖 Creating tutor: ${tutor.name}...`);

    // Create tutor record
    const { data: tutorData, error: tutorError } = await supabase
      .from('tutors')
      .insert({
        owner_id: userId,
        name: tutor.name,
        description: tutor.description,
        avatar_url: tutor.avatar_url || null,
        system_prompt: tutor.system_prompt,
        temperature: tutor.temperature,
        max_tokens: 2000,
        model: tutor.model,
        use_rag: tutor.use_rag,
        max_context_chunks: tutor.max_context_chunks,
        similarity_threshold: tutor.similarity_threshold,
        visibility: tutor.visibility,
        category: tutor.category || null,
        tags: tutor.tags || []
      })
      .select('id')
      .single();

    if (tutorError) {
      result.error = `Failed to create tutor: ${tutorError.message}`;
      return result;
    }

    const tutorId = tutorData.id;
    console.log(`  ✅ Created tutor: ${tutorId}`);

    // Link documents
    let linkedCount = 0;
    for (const category of tutor.documentCategories) {
      const documentId = documentMap.get(category);
      
      if (!documentId) {
        console.log(`  ⚠️  Document not found for category: ${category}`);
        continue;
      }

      const { error: linkError } = await supabase
        .from('tutor_documents')
        .insert({
          tutor_id: tutorId,
          document_id: documentId
        });

      if (linkError) {
        console.log(`  ⚠️  Failed to link document ${category}: ${linkError.message}`);
      } else {
        linkedCount++;
        console.log(`  ✅ Linked document: ${category}`);
      }
    }

    result.success = true;
    result.tutorId = tutorId;
    result.linkedDocuments = linkedCount;
    console.log(`  ✅ Completed: ${tutor.name} (${linkedCount} documents linked)\n`);

    return result;
  } catch (error) {
    result.error = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
    return result;
  }
}

/**
 * Create all seed tutors
 */
export async function createAllTutors(
  userId: string,
  documentMap: Map<string, string>
): Promise<{
  results: CreateTutorResult[];
  tutorMap: Map<string, string>; // tutorName -> tutorId
}> {
  console.log('\n🤖 Starting tutor creation...\n');

  const results: CreateTutorResult[] = [];
  const tutorMap = new Map<string, string>();

  // Create tutors sequentially
  for (const tutor of SEED_TUTORS) {
    const result = await createTutor(userId, tutor, documentMap);
    results.push(result);

    if (result.success && result.tutorId) {
      tutorMap.set(tutor.name, result.tutorId);
    }

    // Small delay between creations
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n📊 Tutor Creation Summary:\n');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalLinked = results.reduce((sum, r) => sum + (r.linkedDocuments || 0), 0);

  console.log(`✅ Successful: ${successful}/${SEED_TUTORS.length}`);
  console.log(`🔗 Total documents linked: ${totalLinked}`);
  
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${SEED_TUTORS.length}`);
    console.log('\nFailed tutors:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.tutorName}: ${r.error}`));
  }

  return { results, tutorMap };
}

/**
 * Main function (for standalone execution)
 */
async function main() {
  try {
    const userId = process.argv[2];
    const documentMapJson = process.argv[3];

    if (!userId || !documentMapJson) {
      throw new Error('Usage: tsx create-tutors.ts <userId> <documentMapJson>');
    }

    const documentMap = new Map<string, string>(JSON.parse(documentMapJson));
    const { results } = await createAllTutors(userId, documentMap);

    const allSuccessful = results.every(r => r.success);
    process.exit(allSuccessful ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

