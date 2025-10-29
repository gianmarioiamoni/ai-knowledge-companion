import { getRequestConfig } from "next-intl/server";
import { readFileSync } from "fs";
import { join } from "path";

export default getRequestConfig(async ({ locale }) => {
  // Use the locale parameter directly if provided, otherwise default to 'en'
  const actualLocale = locale || "en";

  // Read messages from file system
  const messagesPath = join(process.cwd(), "public", "messages", `${actualLocale}.json`);
  const messages = JSON.parse(readFileSync(messagesPath, "utf8"));

  return {
    locale: actualLocale,
    messages,
  };
});
