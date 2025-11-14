"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "@/i18n/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();
        
        // If we get a 403 error, the user account has been deleted
        // Clear the session and redirect to login
        if (error && error.message.includes('403')) {
          console.warn('⚠️  User account deleted or session invalid, clearing local session...')
          await supabase.auth.signOut()
          router.push('/auth/login')
          setUser(null)
          setLoading(false)
          return
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error('Error getting initial session:', err)
        setUser(null)
        setLoading(false)
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Update user state based on session
      if (!session) {
        setUser(null)
        router.push('/auth/login')
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (
    email: string,
    password: string,
    options?: { displayName?: string }
  ) => {
    // Get current locale from URL or default to 'en'
    const currentLocale = window.location.pathname.split('/')[1] || 'en';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${currentLocale}/dashboard`,
        data: {
          display_name: options?.displayName || email.split("@")[0],
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    // Get current locale from URL or default to 'en'
    const currentLocale = window.location.pathname.split('/')[1] || 'en';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // CRITICAL: Must redirect to callback route to exchange OAuth code for session
        redirectTo: `${window.location.origin}/${currentLocale}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signInWithMagicLink = async (email: string) => {
    // Get current locale from URL or default to 'en'
    const currentLocale = window.location.pathname.split('/')[1] || 'en';
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/${currentLocale}/dashboard`,
      },
    });
    return { data, error };
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
    signInWithMagicLink,
  };
}
