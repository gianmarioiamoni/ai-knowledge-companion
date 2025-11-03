/**
 * Card error component
 * Used for error messages within sections or containers
 */

'use client';

import type { JSX } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ErrorSeverity } from '@/types/error';

interface ErrorCardProps {
  message: string;
  severity?: ErrorSeverity;
  className?: string;
  showIcon?: boolean;
}

const severityConfig = {
  error: {
    cardClassName: 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800',
    textClassName: 'text-red-600 dark:text-red-400',
    icon: AlertCircle,
  },
  warning: {
    cardClassName: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800',
    textClassName: 'text-yellow-600 dark:text-yellow-400',
    icon: AlertTriangle,
  },
  info: {
    cardClassName: 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800',
    textClassName: 'text-blue-600 dark:text-blue-400',
    icon: Info,
  },
};

export function ErrorCard({
  message,
  severity = 'error',
  className = '',
  showIcon = true,
}: ErrorCardProps): JSX.Element {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Card className={`${config.cardClassName} ${className}`}>
      <CardContent className="p-4">
        <div className={`flex items-start gap-2 ${config.textClassName}`}>
          {showIcon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          <p className="text-sm">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

