import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./services";
import { IntlErrorCode } from "next-intl";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  let locale = await getUserLocale();
  if (!["en", "zh"].includes(locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: {
      ...(await import(`./messages/${locale}/pages.json`)).default,
      ...(await import(`./messages/${locale}/validation.json`)).default,
      ...(await import(`./messages/${locale}/notification.json`)).default,
      ...(await import(`./messages/${locale}/navigation.json`)).default,
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join(".");

      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        return path + " is not yet translated. Pls inform the developer.";
      } else {
        return "Dear developer, please fix this message: " + path;
      }
    },
  };
});
