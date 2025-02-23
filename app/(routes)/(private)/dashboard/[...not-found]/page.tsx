"use client";

import { useRouter } from "next/navigation";

// ui
import { Button } from "@/components/ui/button";

// pui
import Breadcrumbs from "@/components/layout/breadcrumb";

// external services
import { useTranslations } from "next-intl";

export default function NotFound() {
  const router = useRouter();
  const tCommon = useTranslations("common.not found page");

  return (
    <>
      <Breadcrumbs items={[{ label: "Platform", href: "/dashboard" }]} />

      <div className="m-auto  items-center justify-center text-center">
        <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
          404
        </span>
        <h2 className="font-heading my-2 text-2xl font-bold">{tCommon("title")}</h2>
        <p>{tCommon("description")}</p>
        <div className="mt-8 flex justify-center gap-2">
          <Button onClick={() => router.back()} variant="default" size="lg">
            {tCommon("btn.go back")}
          </Button>
          <Button onClick={() => router.push("/")} variant="ghost" size="lg">
            {tCommon("btn.back to home")}
          </Button>
        </div>
      </div>
    </>
  );
}
