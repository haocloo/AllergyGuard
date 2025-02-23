"use client";

import { usePathname } from "next/navigation";

// services
import { ErrorPage } from "@/services/common";

// external services
import { useLogger, LogLevel } from "next-axiom";
import { useTranslations } from "next-intl";

type ErrorProps = {
  error: ErrorPage & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const pathname = usePathname();
  const log = useLogger({ source: "error.tsx" });
  const status = error.message == "Invalid URL" ? 404 : 500;
  const t = useTranslations("common");

  log.logHttpRequest(
    LogLevel.error,
    error.message,
    {
      host: window.location.href,
      path: pathname,
      statusCode: status,
    },
    {
      error: error.name,
      cause: error.cause,
      stack: error.stack,
      digest: error.digest,
    }
  );

  return (
    <div className="grid h-screen w-screen px-4 place-content-center">
      <div className="text-center">
        <h1 className="font-black text-9xl">401</h1>

        <p className="text-2xl font-bold tracking-tight sm:text-4xl">Unauthorized!</p>

        <p className="mt-4 text-gray-500">{error.message || "Error"}</p>

        {/* digest */}
        <p className="mt-4 text-gray-500">Digest: {error.digest || "Digest"}</p>

        <button
          type="button"
          onClick={() => reset()}
          className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring cursor-pointer">
          {t("try again")}
        </button>
      </div>
    </div>
  );
}
