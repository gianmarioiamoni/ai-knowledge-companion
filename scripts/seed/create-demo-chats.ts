/**
 * Create Demo Conversations
 * 
 * Creates realistic demo conversations between user and tutors
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SEED_CONVERSATIONS, type SeedConversation } from './seed-config';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

interface CreateConversationResult {
  success: boolean;
  conversationId?: string;
  title: string;
  error?: string;
  messageCount?: number;
}

/**
 * Create a single conversation with messages
 */
async function createConversation(
  userId: string,
  conversation: SeedConversation,
  tutorMap: Map<string, string>
): Promise<CreateConversationResult> {
  const result: CreateConversationResult = {
    success: false,
    title: conversation.title
  };

  try {
    console.log(`💬 Creating conversation: ${conversation.title}...`);

    // Get tutor ID
    const tutorId = tutorMap.get(conversation.tutorName);
    
    if (!tutorId) {
      result.error = `Tutor not found: ${conversation.tutorName}`;
      return result;
    }

    // Create conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        tutor_id: tutorId,
        title: conversation.title
      })
      .select('id')
      .single();

    if (convError) {
      result.error = `Failed to create conversation: ${convError.message}`;
      return result;
    }

    const conversationId = convData.id;
    console.log(`  ✅ Created conversation: ${conversationId}`);

    // Create messages
    let messageCount = 0;
    for (const message of conversation.messages) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          sender: message.role === 'user' ? 'user' : 'ai',
          tokens_used: Math.floor(message.content.length / 4), // Rough estimate
          model: 'gpt-4o-mini'
        });

      if (msgError) {
        console.log(`  ⚠️  Failed to create message: ${msgError.message}`);
      } else {
        messageCount++;
        console.log(`  ✅ Added ${message.role} message`);
      }
    }

    // Update conversation metadata
    await supabase
      .from('conversations')
      .update({
        message_count: messageCount,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    result.success = true;
    result.conversationId = conversationId;
    result.messageCount = messageCount;
    console.log(`  ✅ Completed: ${conversation.title} (${messageCount} messages)\n`);

    return result;
  } catch (error) {
    result.error = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
    return result;
  }
}

/**
 * Create all seed conversations
 */
export async function createAllConversations(
  userId: string,
  tutorMap: Map<string, string>
): Promise<{
  results: CreateConversationResult[];
}> {
  console.log('\n💬 Starting conversation creation...\n');

  const results: CreateConversationResult[] = [];

  // Create conversations sequentially
  for (const conversation of SEED_CONVERSATIONS) {
    const result = await createConversation(userId, conversation, tutorMap);
    results.push(result);

    // Small delay between creations
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n📊 Conversation Creation Summary:\n');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalMessages = results.reduce((sum, r) => sum + (r.messageCount || 0), 0);

  console.log(`✅ Successful: ${successful}/${SEED_CONVERSATIONS.length}`);
  console.log(`💬 Total messages: ${totalMessages}`);
  
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${SEED_CONVERSATIONS.length}`);
    console.log('\nFailed conversations:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.title}: ${r.error}`));
  }

  return { results };
}

/**
 * Main function (for standalone execution)
 */
async function main() {
  try {
    const userId = process.argv[2];
    const tutorMapJson = process.argv[3];

    if (!userId || !tutorMapJson) {
      throw new Error('Usage: tsx create-demo-chats.ts <userId> <tutorMapJson>');
    }

    const tutorMap = new Map<string, string>(JSON.parse(tutorMapJson));
    const { results } = await createAllConversations(userId, tutorMap);

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

