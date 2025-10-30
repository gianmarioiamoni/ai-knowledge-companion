import type { JSX } from 'react';

export function TutorsLoading(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading tutors...</p>
      </div>
    </div>
  );
}
