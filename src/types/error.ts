/**
 * Error types and interfaces for centralized error handling
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Error display variants
 */
export type ErrorVariant = 
  | 'inline'      // Small inline error message
  | 'card'        // Error in a card component
  | 'alert'       // Alert component with icon
  | 'page'        // Full page error display
  | 'toast';      // Toast notification (future)

/**
 * Base error interface
 */
export interface AppError {
  message: string;
  severity?: ErrorSeverity;
  code?: string;
  details?: string;
  timestamp?: Date;
}

/**
 * Error display props
 */
export interface ErrorDisplayProps {
  error: string | AppError | null | undefined;
  variant?: ErrorVariant;
  severity?: ErrorSeverity;
  title?: string;
  className?: string;
  onDismiss?: () => void;
  showIcon?: boolean;
  showTimestamp?: boolean;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error handler hook return type
 */
export interface UseErrorHandler {
  error: AppError | null;
  setError: (error: string | AppError | null) => void;
  clearError: () => void;
  hasError: boolean;
}

/**
 * Utility function to normalize error to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (!error) {
    return { message: 'An unknown error occurred', severity: 'error' };
  }

  if (typeof error === 'string') {
    return { message: error, severity: 'error', timestamp: new Date() };
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const appError = error as AppError;
    return {
      message: appError.message,
      severity: appError.severity || 'error',
      code: appError.code,
      details: appError.details,
      timestamp: appError.timestamp || new Date(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      severity: 'error',
      details: error.stack,
      timestamp: new Date(),
    };
  }

  return {
    message: 'An unexpected error occurred',
    severity: 'error',
    timestamp: new Date(),
  };
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: string | AppError | null | undefined): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error.message;
}

