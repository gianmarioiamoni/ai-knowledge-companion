/**
 * Alert error component with dismiss functionality
 * Used for prominent, dismissible error messages
 */

'use client';

import type { JSX } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ErrorSeverity } from '@/types/error';

interface ErrorAlertProps {
  message: string;
  title?: string;
  severity?: ErrorSeverity;
  className?: string;
  onDismiss?: () => void;
  showIcon?: boolean;
}

const severityConfig = {
  error: {
    variant: 'destructive' as const,
    icon: AlertCircle,
  },
  warning: {
    variant: 'default' as const,
    icon: AlertTriangle,
    className: 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600',
  },
  info: {
    variant: 'default' as const,
    icon: Info,
    className: 'border-blue-500/50 text-blue-600 dark:text-blue-400 [&>svg]:text-blue-600',
  },
};

export function ErrorAlert({
  message,
  title,
  severity = 'error',
  className = '',
  onDismiss,
  showIcon = true,
}: ErrorAlertProps): JSX.Element {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Alert 
      variant={config.variant}
      className={`${config.className || ''} ${className}`}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="ml-2 h-auto p-1 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}

