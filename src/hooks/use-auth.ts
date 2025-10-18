"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
        redirectTo: `${window.location.origin}/${currentLocale}/dashboard`,
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
