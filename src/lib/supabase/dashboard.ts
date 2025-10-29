import { createClient } from '@/lib/supabase/client';

export interface DashboardStats {
  totalDocuments: number;
  totalTutors: number;
  totalConversations: number;
  totalMessages: number;
  apiCalls: number;
}

export async function getDashboardStats(): Promise<{ data?: DashboardStats; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Calcola tutte le statistiche in parallelo
    const [
      documentsResult,
      tutorsResult,
      conversationsResult,
      messagesResult,
      apiCallsResult
    ] = await Promise.all([
      // Conta documenti
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id),
      
      // Conta tutor
      supabase
        .from('tutors')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id),
      
      // Conta conversazioni
      supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // Conta messaggi totali (tramite conversazioni)
      supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .then(async (conversationsData) => {
          if (conversationsData.error || !conversationsData.data?.length) {
            return { count: 0 };
          }
          
          const conversationIds = conversationsData.data.map(c => c.id);
          return supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds);
        }),
      
      // Conta API calls (dalla tabella usage_logs)
      supabase
        .from('usage_logs')
        .select('api_calls', { count: 'exact' })
        .eq('user_id', user.id)
        .then(async (result) => {
          if (result.error || !result.data?.length) {
            return { totalApiCalls: 0 };
          }
          
          const totalApiCalls = result.data.reduce((sum, log) => sum + (log.api_calls || 0), 0);
          return { totalApiCalls };
        })
    ]);

    // Gestisci errori
    if (documentsResult.error) {
      console.error('Error fetching documents count:', documentsResult.error);
    }
    if (tutorsResult.error) {
      console.error('Error fetching tutors count:', tutorsResult.error);
    }
    if (conversationsResult.error) {
      console.error('Error fetching conversations count:', conversationsResult.error);
    }
    if (messagesResult.error) {
      console.error('Error fetching messages count:', messagesResult.error);
    }
    if (apiCallsResult.error) {
      console.error('Error fetching API calls count:', apiCallsResult.error);
    }

    const stats: DashboardStats = {
      totalDocuments: documentsResult.count || 0,
      totalTutors: tutorsResult.count || 0,
      totalConversations: conversationsResult.count || 0,
      totalMessages: messagesResult.count || 0,
      apiCalls: 'totalApiCalls' in apiCallsResult ? apiCallsResult.totalApiCalls : 0,
    };

    return { data: stats };
  } catch (error) {
    console.error('Exception fetching dashboard stats:', error);
    return { error: 'Failed to fetch dashboard stats' };
  }
}
