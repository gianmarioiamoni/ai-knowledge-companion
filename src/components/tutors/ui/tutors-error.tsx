import type { JSX } from 'react';
import { ErrorPage } from '@/components/error';
import { useTranslations } from 'next-intl';

interface TutorsErrorProps {
  error: string;
}

export function TutorsError({ error }: TutorsErrorProps): JSX.Element {
  const t = useTranslations('tutors');
  
  return (
    <ErrorPage
      message={error}
      title={t('errors.loadingTitle') || 'Error loading tutors'}
      severity="error"
      showIcon
    />
  );
}
