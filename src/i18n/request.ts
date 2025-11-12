import { getRequestConfig } from "next-intl/server";

// Static imports for Vercel serverless compatibility
// Using dynamic imports with webpack magic comments to ensure they're included in the build
export default getRequestConfig(async ({ locale }) => {
  // Use the locale parameter directly if provided, otherwise default to 'en'
  const actualLocale = locale || "en";

  // Import messages statically (will be bundled by webpack)
  // This works in both development and Vercel production
  const messages = (await import(`../../messages/${actualLocale}.json`)).default;

  return {
    locale: actualLocale,
    messages,
  };
});
