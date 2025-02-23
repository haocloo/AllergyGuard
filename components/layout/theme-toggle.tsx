"use client";

// external
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

// ui
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const t = useTranslations('LocaleSwitcher');
  const { setTheme, theme } = useTheme();

  return (
    <button
      className="flex flex-row items-center gap-2 px-2 pl-1.5 py-2 w-full h-full"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span>{t('toggle theme')}</span>
    </button>
  );
}
