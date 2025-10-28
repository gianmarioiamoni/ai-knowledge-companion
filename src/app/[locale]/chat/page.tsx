'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutor = searchParams.get('tutor') || '';
  const conversation = searchParams.get('conversation') || undefined;

  const handleClose = () => {
    router.push('/tutors');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[calc(100vh-8rem)]">
          <ChatInterface
            tutorId={tutor}
            conversationId={conversation}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
