/**
 * Custom hook for centralized error handling
 * Provides consistent error state management across components
 */

'use client';

import { useState, useCallback } from 'react';
import type { AppError, UseErrorHandler } from '@/types/error';
import { normalizeError } from '@/types/error';

/**
 * Hook for managing error state
 * 
 * @example
 * ```tsx
 * const { error, setError, clearError, hasError } = useErrorHandler();
 * 
 * try {
 *   await someOperation();
 * } catch (err) {
 *   setError(err);
 * }
 * ```
 */
export function useErrorHandler(): UseErrorHandler {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback((error: string | AppError | null) => {
    if (!error) {
      setErrorState(null);
      return;
    }
    
    const normalizedError = normalizeError(error);
    setErrorState(normalizedError);
    
    // Log error for debugging
    console.error('Error:', normalizedError);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const hasError = error !== null;

  return {
    error,
    setError,
    clearError,
    hasError,
  };
}

