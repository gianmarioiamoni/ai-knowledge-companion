import type { JSX } from 'react';
import { ErrorInline } from '@/components/error';

interface TutorDocumentsErrorProps {
  error: string;
}

export function TutorDocumentsError({ error }: TutorDocumentsErrorProps): JSX.Element {
  return (
    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      <ErrorInline message={error} showIcon />
    </div>
  );
}
