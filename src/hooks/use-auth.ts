"use client";

import { useState, useEffect } from "react";

// Mock user for development with valid UUID
const mockUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "user@example.com",
  name: "Test User",
};

export function useAuth() {
  const [user, setUser] = useState<typeof mockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and authentication
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    user,
    loading,
    signIn: async () => {},
    signOut: async () => {},
    signUp: async () => {},
  };
}
