"use client";

import { useMemo } from "react";

// Simple translation messages
const messages = {
  en: {
    "landing.title": "AI Knowledge Companion",
    "landing.subtitle": "Build your personal AI tutor for any subject",
    "landing.description":
      "Upload documents, create custom AI tutors, and get personalized learning assistance powered by your own knowledge base.",
    "landing.cta.primary": "Get Started for Free",
    "landing.cta.secondary": "Learn More",
    "landing.features.upload.title": "Upload Your Materials",
    "landing.features.upload.description":
      "Upload PDFs, documents, and links to build your knowledge base",
    "landing.features.customize.title": "Customize Your Tutor",
    "landing.features.customize.description":
      "Configure tone, language, and teaching style to match your preferences",
    "landing.features.learn.title": "Learn Interactively",
    "landing.features.learn.description":
      "Ask questions and get answers based on your uploaded materials",
    "landing.features.share.title": "Share & Discover",
    "landing.features.share.description":
      "Share your tutors publicly or discover others in the marketplace",
  },
  it: {
    "landing.title": "AI Knowledge Companion",
    "landing.subtitle":
      "Costruisci il tuo tutor AI personale per qualsiasi materia",
    "landing.description":
      "Carica documenti, crea tutor AI personalizzati e ottieni assistenza nell'apprendimento personalizzata basata sulla tua base di conoscenza.",
    "landing.cta.primary": "Inizia Gratuitamente",
    "landing.cta.secondary": "Scopri di Più",
    "landing.features.upload.title": "Carica i Tuoi Materiali",
    "landing.features.upload.description":
      "Carica PDF, documenti e link per costruire la tua base di conoscenza",
    "landing.features.customize.title": "Personalizza il Tuo Tutor",
    "landing.features.customize.description":
      "Configura tono, lingua e stile di insegnamento per adattarsi alle tue preferenze",
    "landing.features.learn.title": "Impara Interattivamente",
    "landing.features.learn.description":
      "Fai domande e ottieni risposte basate sui tuoi materiali caricati",
    "landing.features.share.title": "Condividi e Scopri",
    "landing.features.share.description":
      "Condividi i tuoi tutor pubblicamente o scopri altri nel marketplace",
  },
} as const;

type Locale = "en" | "it";
type MessageKey = keyof typeof messages.en;

export function useTranslations(locale: Locale = "en") {
  const t = useMemo(() => {
    return (key: MessageKey): string => {
      return messages[locale]?.[key] || messages.en[key] || key;
    };
  }, [locale]);

  return { t, locale };
}
