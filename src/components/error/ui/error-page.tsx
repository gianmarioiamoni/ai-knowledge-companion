/**
 * Full-page error component
 * Used for critical errors or page-level error states
 */

'use client';

import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import type { ErrorSeverity } from '@/types/error';

interface ErrorPageProps {
  message: string;
  title?: string;
  severity?: ErrorSeverity;
  className?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    iconClassName: 'text-red-600 dark:text-red-400',
    titleClassName: 'text-gray-900 dark:text-white',
    messageClassName: 'text-gray-600 dark:text-gray-400',
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    titleClassName: 'text-gray-900 dark:text-white',
    messageClassName: 'text-gray-600 dark:text-gray-400',
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-600 dark:text-blue-400',
    titleClassName: 'text-gray-900 dark:text-white',
    messageClassName: 'text-gray-600 dark:text-gray-400',
  },
};

export function ErrorPage({
  message,
  title = 'Something went wrong',
  severity = 'error',
  className = '',
  onRetry,
  retryLabel = 'Try again',
  showIcon = true,
}: ErrorPageProps): JSX.Element {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="text-center max-w-md mx-auto px-4">
        {showIcon && (
          <div className={`mb-6 ${config.iconClassName}`}>
            <Icon className="mx-auto h-16 w-16" />
          </div>
        )}
        
        <h2 className={`text-2xl font-semibold mb-3 ${config.titleClassName}`}>
          {title}
        </h2>
        
        <p className={`text-base mb-6 ${config.messageClassName}`}>
          {message}
        </p>

        {onRetry && (
          <Button onClick={onRetry} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

