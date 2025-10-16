import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Import messages statically
import enMessages from "../../messages/en.json";
import itMessages from "../../messages/it.json";

const messages = {
  en: enMessages,
  it: itMessages,
} as const;

export default getRequestConfig(async ({ locale }) => {
  console.log('🔧 next-intl request.ts - locale:', locale);
  console.log('🔧 next-intl request.ts - routing.locales:', routing.locales);
  
  // Validate that the incoming `locale` parameter is valid
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    console.log('🔧 next-intl request.ts - locale not found, calling notFound()');
    notFound();
  }

  console.log('🔧 next-intl request.ts - returning messages for locale:', locale);
  return {
    locale,
    messages: messages[locale as keyof typeof messages],
  };
});
