import type { JSX } from 'react';

interface TutorDocumentsErrorProps {
  error: string;
}

export function TutorDocumentsError({ error }: TutorDocumentsErrorProps): JSX.Element {
  return (
    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    </div>
  );
}
