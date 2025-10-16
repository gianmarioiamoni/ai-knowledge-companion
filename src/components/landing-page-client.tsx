'use client'

import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Settings, MessageCircle, Share2 } from 'lucide-react'
import Link from 'next/link'

interface LandingPageClientProps {
    locale: 'en' | 'it'
}

// Simple translation messages
const messages = {
    en: {
        title: 'AI Knowledge Companion',
        subtitle: 'Build your personal AI tutor for any subject',
        description: 'Upload documents, create custom AI tutors, and get personalized learning assistance powered by your own knowledge base.',
        ctaPrimary: 'Get Started for Free',
        ctaSecondary: 'Learn More',
        uploadTitle: 'Upload Your Materials',
        uploadDesc: 'Upload PDFs, documents, and links to build your knowledge base',
        customizeTitle: 'Customize Your Tutor',
        customizeDesc: 'Configure tone, language, and teaching style to match your preferences',
        learnTitle: 'Learn Interactively',
        learnDesc: 'Ask questions and get answers based on your uploaded materials',
        shareTitle: 'Share & Discover',
        shareDesc: 'Share your tutors publicly or discover others in the marketplace'
    },
    it: {
        title: 'AI Knowledge Companion',
        subtitle: 'Costruisci il tuo tutor AI personale per qualsiasi materia',
        description: 'Carica documenti, crea tutor AI personalizzati e ottieni assistenza nell\'apprendimento personalizzata basata sulla tua base di conoscenza.',
        ctaPrimary: 'Inizia Gratuitamente',
        ctaSecondary: 'Scopri di Più',
        uploadTitle: 'Carica i Tuoi Materiali',
        uploadDesc: 'Carica PDF, documenti e link per costruire la tua base di conoscenza',
        customizeTitle: 'Personalizza il Tuo Tutor',
        customizeDesc: 'Configura tono, lingua e stile di insegnamento per adattarsi alle tue preferenze',
        learnTitle: 'Impara Interattivamente',
        learnDesc: 'Fai domande e ottieni risposte basate sui tuoi materiali caricati',
        shareTitle: 'Condividi e Scopri',
        shareDesc: 'Condividi i tuoi tutor pubblicamente o scopri altri nel marketplace'
    }
}

export function LandingPageClient({ locale }: LandingPageClientProps): JSX.Element {
    const t = messages[locale]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        {t.title}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        {t.subtitle}
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                        {t.description}
                    </p>

                    <div className="flex gap-4 justify-center flex-col sm:flex-row">
                        <Link href="/auth/signup">
                            <Button size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                                {t.ctaPrimary}
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button variant="outline" size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                                {t.ctaSecondary}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card className="text-center">
                        <CardHeader>
                            <Upload className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                            <CardTitle>{t.uploadTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {t.uploadDesc}
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <Settings className="h-12 w-12 mx-auto text-green-600 mb-4" />
                            <CardTitle>{t.customizeTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {t.customizeDesc}
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <MessageCircle className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                            <CardTitle>{t.learnTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {t.learnDesc}
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <Share2 className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                            <CardTitle>{t.shareTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {t.shareDesc}
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
