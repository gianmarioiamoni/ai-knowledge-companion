import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// Re-export types and constants from routing
export type Locale = (typeof routing.locales)[number];
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
