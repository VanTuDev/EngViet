"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircleOutlined,
  GoogleOutlined,
  LoadingOutlined,
  MailOutlined,
  UserAddOutlined,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { googleLoginUrl } from "@/lib/api/envelope";
import { registerAccount } from "@/lib/api/auth-actions";

/**
 * Self-registration — always creates a **student**. Verifying the email (link
 * shown here in dev, also delivered to the notification bell) is what later
 * unlocks the teacher workspace. There is no "register as teacher" path any more.
 */
export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth.register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState<{ verifyUrl?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await registerAccount({ email, password, fullName });
    if (res.ok) {
      setDone({ verifyUrl: res.verifyUrl });
      router.refresh();
    } else {
      setError(res.error ?? t("failed"));
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/50 text-2xl text-secondary">
          <CheckCircleOutlined />
        </span>
        <h1 className="mt-4 font-heading text-headline-md text-on-surface">{t("successTitle")}</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">{t("successBody")}</p>

        {done.verifyUrl ? (
          <div className="mt-5 w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-4 text-left">
            <p className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
              <MailOutlined aria-hidden="true" />
              {t("devLinkNote")}
            </p>
            <Button asChild size="lg" className="mt-3 w-full">
              <a href={done.verifyUrl}>{t("verifyNow")}</a>
            </Button>
          </div>
        ) : null}

        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href="/student/dashboard">{t("continueToApp")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-headline-md text-on-surface">{t("title")}</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">{t("nameLabel")}</Label>
          <Input
            id="fullName"
            required
            placeholder={t("namePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? <LoadingOutlined spin /> : <UserAddOutlined />}
          {t("submit")}
        </Button>
      </form>

      {error ? <p className="mt-3 text-center font-label-sm text-label-sm text-error">{error}</p> : null}

      <div className="my-5 flex items-center gap-3 text-label-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant/60" />
        {t("orDivider")}
        <span className="h-px flex-1 bg-outline-variant/60" />
      </div>

      <Button asChild variant="outline" className="w-full">
        <a href={googleLoginUrl()}>
          <GoogleOutlined />
          {t("googleButton")}
        </a>
      </Button>

      <p className="mt-6 text-center text-body-sm text-on-surface-variant">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-label-md text-label-md text-primary hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
