import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "⚠️ Supabase environment variables not found. Using mock client for development."
    );
    // Return a mock client for development
    return createMockSupabaseClient();
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Mock Supabase client for development without real Supabase setup
function createMockSupabaseClient() {
  const mockResponse = { data: [], error: null };

  // Create a chainable query builder mock
  const createQueryBuilder = (finalData: any = []) => {
    const builder = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      eq: () => builder,
      order: () => builder,
      single: () =>
        Promise.resolve({
          data: finalData.length > 0 ? finalData[0] : null,
          error: null,
        }),
      // For non-single queries, return the data directly
      then: (resolve: any) => resolve({ data: finalData, error: null }),
    };
    return builder;
  };

  return {
    from: (table: string) => {
      console.log(`🔧 Mock Supabase: Querying table "${table}"`);
      return createQueryBuilder([]);
    },
    storage: {
      from: (bucket: string) => {
        console.log(`🔧 Mock Supabase: Accessing storage bucket "${bucket}"`);
        return {
          upload: (path: string, file: any) => {
            console.log(`🔧 Mock Supabase: Uploading file to "${path}"`);
            return Promise.resolve({
              data: { path: `mock/${path}` },
              error: null,
            });
          },
          remove: (paths: string[]) => {
            console.log(`🔧 Mock Supabase: Removing files:`, paths);
            return Promise.resolve({ data: null, error: null });
          },
          createSignedUrl: (path: string, expiresIn: number) => {
            console.log(`🔧 Mock Supabase: Creating signed URL for "${path}"`);
            return Promise.resolve({
              data: {
                signedUrl: `https://mock-storage.com/${path}?expires=${expiresIn}`,
              },
              error: null,
            });
          },
        };
      },
    },
    auth: {
      getUser: () => {
        console.log(`🔧 Mock Supabase: Getting user`);
        return Promise.resolve({
          data: { user: null },
          error: null,
        });
      },
      signInWithPassword: () => Promise.resolve(mockResponse),
      signUp: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve(mockResponse),
    },
  } as any;
}
