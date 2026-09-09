import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoadingOutlined } from "@/components/icons";
import { VerifyEmailRunner } from "@/components/features/auth/verify-email-runner";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.verifyEmail" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/verify-email",
    locale: locale as AppLocale,
  });
}

export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<LoadingOutlined spin className="mx-auto block text-3xl text-primary" />}>
      <VerifyEmailRunner />
    </Suspense>
  );
}
