/**
 * Inline error message component
 * Used for small, contextual error messages (e.g., form fields)
 */

'use client';

import type { JSX } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ErrorSeverity } from '@/types/error';

interface ErrorInlineProps {
  message: string;
  severity?: ErrorSeverity;
  className?: string;
  showIcon?: boolean;
}

const severityConfig = {
  error: {
    className: 'text-red-600 dark:text-red-400',
    icon: AlertCircle,
  },
  warning: {
    className: 'text-yellow-600 dark:text-yellow-400',
    icon: AlertTriangle,
  },
  info: {
    className: 'text-blue-600 dark:text-blue-400',
    icon: Info,
  },
};

export function ErrorInline({
  message,
  severity = 'error',
  className = '',
  showIcon = true,
}: ErrorInlineProps): JSX.Element {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2 text-sm ${config.className} ${className}`}>
      {showIcon && <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />}
      <p>{message}</p>
    </div>
  );
}

