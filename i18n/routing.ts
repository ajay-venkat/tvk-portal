import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // All supported locales
  locales: ["ta", "en"],

  // Tamil is the default locale
  defaultLocale: "ta",

  // 'as-needed' means the default locale (Tamil) won't show /ta/ prefix
  // Only /en/ prefix is shown for English routes
  localePrefix: "as-needed",
});
