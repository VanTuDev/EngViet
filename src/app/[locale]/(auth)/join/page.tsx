import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StudentJoinForm } from "@/components/features/auth/student-join-form";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.join" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/join",
    locale: locale as AppLocale,
  });
}

export default async function JoinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StudentJoinForm />;
}
