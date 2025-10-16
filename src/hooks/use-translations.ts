"use client";

import { useMemo } from "react";
import enTranslations from "@/translations/en.json";
import itTranslations from "@/translations/it.json";

type Locale = "en" | "it";
type TranslationKey = string;

const translations = {
  en: enTranslations,
  it: itTranslations,
} as const;

// Helper function to get nested object value by dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

export function useTranslations(locale: Locale = "en") {
  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      const translation = getNestedValue(translations[locale], key);
      // Fallback to English if translation not found
      if (translation === key && locale !== 'en') {
        return getNestedValue(translations.en, key);
      }
      return translation;
    };
  }, [locale]);

  return { t, locale };
}
