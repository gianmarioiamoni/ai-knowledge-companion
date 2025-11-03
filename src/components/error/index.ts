/**
 * Centralized error handling components
 * 
 * @example Basic usage
 * ```tsx
 * import { ErrorDisplay } from '@/components/error';
 * 
 * <ErrorDisplay error="Something went wrong" variant="card" />
 * ```
 * 
 * @example With hook
 * ```tsx
 * import { ErrorDisplay } from '@/components/error';
 * import { useErrorHandler } from '@/hooks/use-error-handler';
 * 
 * const { error, setError, clearError } = useErrorHandler();
 * 
 * <ErrorDisplay 
 *   error={error} 
 *   variant="alert" 
 *   onDismiss={clearError}
 * />
 * ```
 */

export { ErrorDisplay } from './error-display';
export { ErrorInline } from './ui/error-inline';
export { ErrorCard } from './ui/error-card';
export { ErrorAlert } from './ui/error-alert';
export { ErrorPage } from './ui/error-page';

