import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  // Use the locale parameter directly if provided, otherwise default to 'en'
  const actualLocale = locale || "en";

  // Import messages dynamically based on actual locale
  const messages = (await import(`../../public/messages/${actualLocale}.json`))
    .default;

  return {
    locale: actualLocale,
    messages,
  };
});
