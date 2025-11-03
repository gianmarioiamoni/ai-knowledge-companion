/**
 * Universal error display component
 * Automatically selects the appropriate error variant based on props
 */

'use client';

import type { JSX } from 'react';
import type { ErrorDisplayProps } from '@/types/error';
import { formatErrorMessage, normalizeError } from '@/types/error';
import { ErrorInline } from './ui/error-inline';
import { ErrorCard } from './ui/error-card';
import { ErrorAlert } from './ui/error-alert';
import { ErrorPage } from './ui/error-page';

export function ErrorDisplay({
  error,
  variant = 'card',
  severity,
  title,
  className,
  onDismiss,
  showIcon = true,
  showTimestamp = false,
}: ErrorDisplayProps): JSX.Element | null {
  // Early return if no error
  if (!error) return null;

  // Normalize error to AppError format
  const normalizedError = normalizeError(error);
  const message = formatErrorMessage(error);
  const errorSeverity = severity || normalizedError.severity || 'error';

  // Add timestamp if requested
  const displayMessage = showTimestamp && normalizedError.timestamp
    ? `${message} (${normalizedError.timestamp.toLocaleTimeString()})`
    : message;

  // Render appropriate variant
  switch (variant) {
    case 'inline':
      return (
        <ErrorInline
          message={displayMessage}
          severity={errorSeverity}
          className={className}
          showIcon={showIcon}
        />
      );

    case 'card':
      return (
        <ErrorCard
          message={displayMessage}
          severity={errorSeverity}
          className={className}
          showIcon={showIcon}
        />
      );

    case 'alert':
      return (
        <ErrorAlert
          message={displayMessage}
          title={title}
          severity={errorSeverity}
          className={className}
          onDismiss={onDismiss}
          showIcon={showIcon}
        />
      );

    case 'page':
      return (
        <ErrorPage
          message={displayMessage}
          title={title}
          severity={errorSeverity}
          className={className}
          showIcon={showIcon}
        />
      );

    default:
      return (
        <ErrorCard
          message={displayMessage}
          severity={errorSeverity}
          className={className}
          showIcon={showIcon}
        />
      );
  }
}

