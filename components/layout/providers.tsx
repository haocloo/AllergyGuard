"use client";
// external
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
    >
      {children}
    </NextThemesProvider>

  );
}
