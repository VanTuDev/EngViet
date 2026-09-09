"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { App, Button } from "antd";
import { CheckCircleOutlined, MailOutlined, RocketOutlined } from "@/components/icons";
import { resendVerificationAction } from "@/lib/api/auth-actions";

/**
 * Shown on the settings page for a student who hasn't verified their email yet —
 * the one action that unlocks the teacher workspace. Re-requests the dev-mode
 * link and shows it inline (there's no mail provider wired up yet).
 */
export function EmailVerificationCard({ emailVerified }: { emailVerified: boolean }) {
  const t = useTranslations("workspace.verifyCard");
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  if (emailVerified) return null;

  async function resend() {
    setLoading(true);
    const res = await resendVerificationAction();
    setLoading(false);
    if (res.ok && res.verifyUrl) {
      setLink(res.verifyUrl);
    } else {
      message.error(res.error ?? t("failed"));
    }
  }

  return (
    <section className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container/50 text-xl text-primary">
          <RocketOutlined />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-headline-sm text-on-surface">{t("title")}</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">{t("body")}</p>
        </div>
      </div>

      {link ? (
        <div className="mt-4 rounded-xl border border-outline-variant/50 bg-surface-container-low p-4">
          <p className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <MailOutlined aria-hidden="true" />
            {t("devLinkNote")}
          </p>
          <Button type="primary" size="large" href={link} className="mt-3 w-full sm:w-auto">
            <CheckCircleOutlined /> {t("verifyNow")}
          </Button>
        </div>
      ) : (
        <Button type="primary" size="large" loading={loading} onClick={resend} className="mt-4 w-full sm:w-auto">
          <MailOutlined /> {t("resend")}
        </Button>
      )}
    </section>
  );
}
