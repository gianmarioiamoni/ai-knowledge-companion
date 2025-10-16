import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "it"],

  // Used when no locale matches
  defaultLocale: "en",

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames: {
    "/": "/",
    "/dashboard": {
      en: "/dashboard",
      it: "/dashboard",
    },
    "/tutors": {
      en: "/tutors",
      it: "/tutor",
    },
    "/documents": {
      en: "/documents",
      it: "/documenti",
    },
    "/marketplace": {
      en: "/marketplace",
      it: "/marketplace",
    },
    "/settings": {
      en: "/settings",
      it: "/impostazioni",
    },
    "/auth/login": {
      en: "/auth/login",
      it: "/auth/accedi",
    },
    "/auth/signup": {
      en: "/auth/signup",
      it: "/auth/registrati",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
