import { useTranslations } from 'next-intl';
import type { JSX } from 'react';

interface TutorCardFooterProps {
  lastUsedDate: string | null;
}

export function TutorCardFooter({ lastUsedDate }: TutorCardFooterProps): JSX.Element {
  const t = useTranslations('tutors');

  if (!lastUsedDate) {
    return <></>;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {t('card.lastUsed', { date: lastUsedDate })}
      </div>
    </div>
  );
}
