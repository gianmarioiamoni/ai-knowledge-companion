import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "it"],

  // Used when no locale matches
  defaultLocale: "en",
  
  // Ensure locale is always in the URL
  localePrefix: "always"
});

export type Locale = (typeof routing.locales)[number];
