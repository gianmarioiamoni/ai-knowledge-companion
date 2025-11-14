import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/contact-form';
import { Mail, MessageSquare } from 'lucide-react';

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

// Mark as dynamic to support authentication check
export const dynamic = 'force-dynamic';

/**
 * Contact page
 * - Accessible to both authenticated and unauthenticated users
 * - Auto-fills email for authenticated users
 * - Requires email input for guest users
 * - Responsive design
 */
export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            {t('title')}
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Contact Form */}
        <ContactForm />

        {/* Alternative contact methods */}
        <div className="max-w-2xl mx-auto mt-12 sm:mt-16">
          <div className="border-t border-border pt-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>
                Or email us directly at{' '}
                <a 
                  href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@example.com'}`}
                  className="text-primary hover:underline font-medium"
                >
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@example.com'}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

