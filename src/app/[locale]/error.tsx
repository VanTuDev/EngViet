"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ReloadOutlined, WarningOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Ranh giới lỗi cho toàn bộ cây `[locale]` — thay cho trang lỗi mặc định xấu xí
 * của Next khi một Server/Client Component ném lỗi lúc render.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  const tc = useTranslations("common");

  useEffect(() => {
    // Chỗ để nối tới dịch vụ log lỗi (Sentry...) sau này.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-margin-mobile text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container/40 text-3xl text-error">
        <WarningOutlined />
      </div>
      <h1 className="font-heading text-headline-lg text-on-surface">{t("title")}</h1>
      <p className="max-w-sm text-body-md text-on-surface-variant">{t("description")}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <ReloadOutlined /> {t("retry")}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{tc("backToHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
