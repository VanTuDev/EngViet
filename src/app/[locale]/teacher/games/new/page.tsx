import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { QuizSetBuilderForm } from "@/components/features/games/quiz-set-builder-form";
import { buildPrivateMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.games.builder");
  return buildPrivateMetadata(t("meta"));
}

export default async function NewQuizSetPage() {
  const t = await getTranslations("dash.games.builder");
  return (
    <>
      <PageHeader title={t("pageTitle")} description={t("pageDesc")} />
      <QuizSetBuilderForm />
    </>
  );
}
