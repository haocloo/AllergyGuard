// external
import { useLocale, useTranslations } from "next-intl";

// pui
import LocaleSwitcher from "./locale-switcher";

export function LocaleSelector() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();

  return (
    <LocaleSwitcher
      defaultValue={locale}
      items={[
        {
          value: "en",
          label: t("en"),
        },
        {
          value: "zh",
          label: t("zh"),
        },
      ]}
      label={t("label")}
    />
  );
}
