import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined, try to get it from headers or use default
  let actualLocale = locale;
  if (!actualLocale) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    
    // Extract locale from pathname
    const match = pathname.match(/^\/([a-z]{2})/);
    actualLocale = match ? match[1] : "en";
  }
  
  // Import messages dynamically based on actual locale
  const messages = (await import(`../../messages/${actualLocale}.json`)).default;
  
  return {
    locale: actualLocale,
    messages,
  };
});
