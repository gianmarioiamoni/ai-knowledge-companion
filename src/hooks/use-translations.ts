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
     // Documents page
     "documents.title": "Documents",
     "documents.subtitle": "Manage your knowledge base documents",
     "documents.upload.title": "Upload New Document",
     "documents.upload.description": "Drag and drop files here or click to browse. Supported formats: PDF, TXT, MD",
     "documents.upload.dropzone": "Drop files here",
     "documents.upload.browse": "or click to select files",
     "documents.upload.button": "Browse Files",
     "documents.list.title": "Your Documents",
     "documents.list.empty": "No documents uploaded yet. Upload your first document to get started.",
     "documents.actions.preview": "Preview",
     "documents.actions.delete": "Delete",
     "documents.status.processed": "Processed",
     "documents.status.processing": "Processing",
     "documents.meta.uploaded": "Uploaded",
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
     // Documents page
     "documents.title": "Documenti",
     "documents.subtitle": "Gestisci i documenti della tua base di conoscenza",
     "documents.upload.title": "Carica Nuovo Documento",
     "documents.upload.description": "Trascina i file qui o clicca per sfogliare. Formati supportati: PDF, TXT, MD",
     "documents.upload.dropzone": "Rilascia i file qui",
     "documents.upload.browse": "o clicca per selezionare i file",
     "documents.upload.button": "Sfoglia File",
     "documents.list.title": "I Tuoi Documenti",
     "documents.list.empty": "Nessun documento caricato. Carica il tuo primo documento per iniziare.",
     "documents.actions.preview": "Anteprima",
     "documents.actions.delete": "Elimina",
     "documents.status.processed": "Elaborato",
     "documents.status.processing": "In elaborazione",
     "documents.meta.uploaded": "Caricato",
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
