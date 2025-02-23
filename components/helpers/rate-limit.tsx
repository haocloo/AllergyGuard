"use client";
import { useEffect, useCallback } from "react";

// ui
import { useToast } from "@/hooks/use-toast";

// external
import { useTranslations } from "next-intl";

interface RateLimitNotificationProps {
  feature: string;
}

export function RateLimitExceeded({ feature }: RateLimitNotificationProps) {
  const t = useTranslations("validation.rateLimit");
  const { toast } = useToast();

  const showToast = useCallback(() => {
    toast({
      title: t("title", { feature: t(`features.${feature}`) }),
      description: t("tryAgainLater"),
      variant: "destructive",
      duration: 5000,
    });
  }, [feature, toast, t]);

  useEffect(() => {
    showToast();
  }, [showToast]);

  return null;
}
