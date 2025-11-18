/**
 * Upload and Process Documents
 * 
 * Uploads seed documents to Supabase Storage and triggers processing
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { CONTENT_DIR, SEED_DOCUMENTS, type SeedDocument } from './seed-config';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

interface UploadResult {
  success: boolean;
  documentId?: string;
  title: string;
  error?: string;
}

/**
 * Upload a single document
 */
async function uploadDocument(
  userId: string,
  doc: SeedDocument
): Promise<UploadResult> {
  const result: UploadResult = {
    success: false,
    title: doc.title
  };

  try {
    console.log(`📄 Uploading: ${doc.title}...`);

    // Read file content
    const filePath = path.join(CONTENT_DIR, doc.filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileBuffer = Buffer.from(fileContent);

    // Generate unique storage path
    const timestamp = Date.now();
    const storagePath = `documents/${userId}/${timestamp}-${doc.filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: 'text/markdown',
        upsert: false
      });

    if (uploadError) {
      result.error = `Storage upload failed: ${uploadError.message}`;
      return result;
    }

    console.log(`  ✅ Uploaded to storage: ${storagePath}`);

    // Get file size
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Create document record in database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        owner_id: userId,
        title: doc.title,
        description: doc.description,
        storage_path: storagePath,
        mime_type: 'text/markdown',
        file_size: fileSize,
        visibility: doc.visibility,
        status: 'processing',
        media_type: 'document'
      })
      .select('id')
      .single();

    if (docError) {
      result.error = `Database insert failed: ${docError.message}`;
      return result;
    }

    const documentId = docData.id;
    console.log(`  ✅ Created DB record: ${documentId}`);

    // Trigger processing via API
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const processResponse = await fetch(`${apiUrl}/api/documents/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ documentId })
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      result.error = `Processing API failed: ${processResponse.status} - ${errorText}`;
      return result;
    }

    console.log(`  ✅ Processing triggered`);

    // Wait for processing to complete (poll status)
    await waitForProcessing(documentId, 60000); // 60 second timeout

    result.success = true;
    result.documentId = documentId;
    console.log(`  ✅ Processing completed: ${doc.title}\n`);

    return result;
  } catch (error) {
    result.error = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
    return result;
  }
}

/**
 * Wait for document processing to complete
 */
async function waitForProcessing(
  documentId: string,
  timeoutMs: number = 60000
): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 2000; // Check every 2 seconds

  while (Date.now() - startTime < timeoutMs) {
    const { data, error } = await supabase
      .from('documents')
      .select('status')
      .eq('id', documentId)
      .single();

    if (error) {
      throw new Error(`Failed to check document status: ${error.message}`);
    }

    if (data.status === 'ready') {
      return;
    }

    if (data.status === 'failed') {
      throw new Error('Document processing failed');
    }

    // Still processing, wait and check again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Document processing timeout');
}

/**
 * Get user ID by email
 */
async function getUserIdByEmail(email: string): Promise<string> {
  // First try profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!profileError && profileData) {
    return profileData.id;
  }

  // If not in profiles, try auth.users (requires service role)
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    throw new Error(`Failed to fetch users: ${authError.message}`);
  }

  const user = authData.users.find(u => u.email === email);

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  return user.id;
}

/**
 * Upload all seed documents
 */
export async function uploadAllDocuments(userEmail: string): Promise<{
  userId: string;
  results: UploadResult[];
  documentMap: Map<string, string>; // category -> documentId
}> {
  console.log('\n🚀 Starting document upload...\n');
  console.log(`📧 Target user: ${userEmail}\n`);

  // Get user ID
  const userId = await getUserIdByEmail(userEmail);
  console.log(`👤 User ID: ${userId}\n`);

  const results: UploadResult[] = [];
  const documentMap = new Map<string, string>();

  // Upload documents sequentially (to avoid rate limits and resource issues)
  for (const doc of SEED_DOCUMENTS) {
    const result = await uploadDocument(userId, doc);
    results.push(result);

    if (result.success && result.documentId) {
      documentMap.set(doc.category, result.documentId);
    }

    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📊 Upload Summary:\n');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${SEED_DOCUMENTS.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${SEED_DOCUMENTS.length}`);
    console.log('\nFailed documents:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.title}: ${r.error}`));
  }

  return { userId, results, documentMap };
}

/**
 * Main function (for standalone execution)
 */
async function main() {
  try {
    const userEmail = process.argv[2] || process.env.TARGET_USER_EMAIL;

    if (!userEmail) {
      throw new Error('User email not provided. Usage: tsx upload-documents.ts user@example.com');
    }

    const { results } = await uploadAllDocuments(userEmail);

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

