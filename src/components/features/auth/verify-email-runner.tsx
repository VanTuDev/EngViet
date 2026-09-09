"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircleOutlined, LoadingOutlined, WarningOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/lib/api/auth-actions";
import { Link, useRouter } from "@/i18n/navigation";

type Outcome = { state: "working" } | { state: "ok" } | { state: "error"; error: string };

/**
 * Client leaf: reads `?token`, calls the verify Server Action once (it sets a
 * fresh session for the now-verified user), then replaces to the teacher
 * dashboard — landing them straight in the workspace they just unlocked.
 * Kept out of the page file so `useSearchParams` sits under `<Suspense>`.
 */
export function VerifyEmailRunner() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const token = useSearchParams().get("token");
  const ran = useRef(false);
  // Only ever set from an async callback — a missing token is derived during render, not set here
  // (a synchronous setState in an effect is a lint error).
  const [asyncOutcome, setAsyncOutcome] = useState<Extract<Outcome, { state: "ok" | "error" }> | null>(null);

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;
    void verifyEmailAction(token).then((res) => {
      if (res.ok) {
        setAsyncOutcome({ state: "ok" });
        router.replace("/teacher/dashboard");
        router.refresh();
      } else {
        setAsyncOutcome({ state: "error", error: res.error ?? t("failed") });
      }
    });
  }, [token, router, t]);

  const outcome: Outcome = !token
    ? { state: "error", error: t("missingToken") }
    : (asyncOutcome ?? { state: "working" });

  if (outcome.state === "working") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <LoadingOutlined spin className="text-3xl text-primary" />
        <p className="text-body-md text-on-surface-variant">{t("working")}</p>
      </div>
    );
  }

  if (outcome.state === "ok") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/50 text-2xl text-secondary">
          <CheckCircleOutlined />
        </span>
        <h1 className="font-heading text-headline-md text-on-surface">{t("okTitle")}</h1>
        <p className="text-body-sm text-on-surface-variant">{t("okBody")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-container/40 text-2xl text-error">
        <WarningOutlined />
      </div>
      <h1 className="font-heading text-headline-md text-on-surface">{t("failed")}</h1>
      <p className="max-w-sm text-body-sm text-on-surface-variant">{outcome.error}</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/student/settings">{t("backToSettings")}</Link>
      </Button>
    </div>
  );
}
