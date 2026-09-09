import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ReadOutlined } from "@/components/icons";
import { SrsInsightsView } from "@/components/features/srs/srs-insights-view";
import { TeacherClassDecks } from "@/components/features/decks/teacher-class-decks";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";
import { getClassDeckLibrary } from "@/lib/api/decks";
import { getSrsInsights } from "@/lib/api/srs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.srs.insights");
  return buildPrivateMetadata(t("meta"));
}

export default async function TeacherVocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const t = await getTranslations("dash.srs.insights");
  const { classId } = await searchParams;
  const classes = await getMyClasses("owned");

  if (classes.length === 0) {
    return (
      <>
        <PageHeader title={t("title")} description={t("desc")} />
        <EmptyState icon={ReadOutlined} title={t("noClasses")} description={t("noClassesHint")} />
      </>
    );
  }

  const activeClassId = classes.some((c) => c.id === classId) ? classId! : classes[0]!.id;
  const [insights, deckLibrary] = await Promise.all([
    getSrsInsights(activeClassId),
    getClassDeckLibrary(activeClassId),
  ]);

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <SrsInsightsView classes={classes} activeClassId={activeClassId} insights={insights} />
      <TeacherClassDecks classId={activeClassId} decks={deckLibrary} />
    </>
  );
}
