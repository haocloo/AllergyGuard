"use client";

import { useTransition } from "react";

// external
import { Locale } from "@/lib/i18n/config";
import { setUserLocale } from "@/lib/i18n/services";

// ui
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Languages } from "lucide-react";

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcher({ defaultValue, items, label }: Props) {
  const [isPending, startTransition] = useTransition();
  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={`border-0 focus:ring-0 max-h-8 focus:ring-offset-0 flex justify-start bg-transparent rounded-sm px-2 pl-1.5 py-0  ${
          isPending && "pointer-events-none opacity-60"
        }`}>
        <div className="flex flex-row flex-1 gap-2 items-center">
          <Languages />
          <div className="leading-none">{label}</div>
        </div>
        {/* <SelectValue placeholder={label} /> */}
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
