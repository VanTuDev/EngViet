"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LoadingOutlined, WarningOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { establishSessionFromCode } from "@/lib/api/auth-actions";
import { Link, useRouter } from "@/i18n/navigation";

/**
 * Client leaf: reads `?code`, calls the Server Action once (it sets the session
 * cookies), then hard-replaces to the role dashboard. Kept out of the page file
 * so `useSearchParams` sits under a `<Suspense>` boundary.
 */
export function AuthCallbackRunner() {
  const t = useTranslations("auth.callback");
  const router = useRouter();
  const code = useSearchParams().get("code");
  const ran = useRef(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current || !code) return;
    ran.current = true;

    void establishSessionFromCode(code).then((res) => {
      if (res.ok && res.role) {
        router.replace(`/${res.role}/dashboard`);
        router.refresh();
      } else {
        setExchangeError(res.error ?? t("failed"));
      }
    });
  }, [code, router, t]);

  const error = !code ? t("missingCode") : exchangeError;

  if (!error) {
    return (
      <>
        <LoadingOutlined spin className="text-3xl text-primary" />
        <p className="text-body-md text-on-surface-variant">{t("signingIn")}</p>
      </>
    );
  }

  return (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-container/40 text-2xl text-error">
        <WarningOutlined />
      </div>
      <h1 className="font-heading text-headline-md text-on-surface">{t("failed")}</h1>
      <p className="max-w-sm text-body-sm text-on-surface-variant">{error}</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/login">{t("backToLogin")}</Link>
      </Button>
    </>
  );
}
