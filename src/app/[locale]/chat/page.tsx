'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getTutor } from '@/lib/supabase/tutors';
import type { Tutor } from '@/types/tutors';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get('tutor') || '';
  const conversation = searchParams.get('conversation') || undefined;
  const locale = (params.locale as string) || 'en';
  
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tutorId) {
      getTutor(tutorId).then(({ data, error }) => {
        if (data) setTutor(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [tutorId]);

  const handleClose = () => {
    router.push('/tutors');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[calc(100vh-8rem)]">
          <ChatInterface
            tutorId={tutorId}
            conversationId={conversation}
            tutor={tutor || undefined}
            locale={locale}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
