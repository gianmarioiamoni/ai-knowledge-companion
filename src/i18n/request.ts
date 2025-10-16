import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import enMessages from "../messages/en.json";
import itMessages from "../messages/it.json";

const messages = {
  en: enMessages,
  it: itMessages,
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) notFound();

  return {
    messages: messages[locale as keyof typeof messages],
  };
});
