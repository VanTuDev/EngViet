import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { DeckList } from "@/components/features/decks/deck-list";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyDecks } from "@/lib/api/decks";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.decks");
  return buildPrivateMetadata(t("meta"));
}

export default async function StudentDecksPage() {
  const t = await getTranslations("dash.decks");
  const decks = await getMyDecks();

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <DeckList decks={decks} />
    </>
  );
}
