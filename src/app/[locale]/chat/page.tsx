import { ChatInterface } from '@/components/chat';

interface ChatPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tutor?: string; conversation?: string }>;
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { locale } = await params;
  const { tutor, conversation } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[calc(100vh-8rem)]">
          <ChatInterface
            tutorId={tutor || ''}
            conversationId={conversation}
            onClose={() => {
              // TODO: Navigate back to tutors page
            }}
          />
        </div>
      </div>
    </div>
  );
}
