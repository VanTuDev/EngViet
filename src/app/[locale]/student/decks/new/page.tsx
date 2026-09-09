import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { DeckForm } from "@/components/features/decks/deck-form";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.decks.new");
  return buildPrivateMetadata(t("meta"));
}

export default async function NewDeckPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const t = await getTranslations("dash.decks.new");
  const tNav = await getTranslations("nav");
  const { classId } = await searchParams;
  // Empty for a pure student (they own no classes) → the "attach to class" picker is hidden.
  const owned = await getMyClasses("owned").catch(() => []);

  return (
    <>
      <Breadcrumbs items={[{ label: tNav("studentDecks"), href: "/student/decks" }, { label: t("title") }]} />
      <PageHeader title={t("title")} description={t("desc")} />
      <DeckForm
        mode="create"
        ownedClasses={owned.map((c) => ({ id: c.id, name: c.name }))}
        defaultClassId={classId}
      />
    </>
  );
}
