import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DeckDetailView } from "@/components/features/decks/deck-detail-view";
import { buildPrivateMetadata } from "@/lib/seo";
import { getDeck } from "@/lib/api/decks";
import { getCurrentUser } from "@/lib/api/session";

export async function generateMetadata({ params }: { params: Promise<{ deckId: string }> }): Promise<Metadata> {
  const { deckId } = await params;
  const deck = await getDeck(deckId);
  const t = await getTranslations("dash.decks");
  return buildPrivateMetadata(deck ? deck.title : t("metaFallback"));
}

export default async function DeckDetailPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  const [deck, user] = await Promise.all([getDeck(deckId), getCurrentUser()]);
  if (!deck) notFound();

  const tNav = await getTranslations("nav");

  return (
    <>
      <Breadcrumbs items={[{ label: tNav("studentDecks"), href: "/student/decks" }, { label: deck.title }]} />
      <DeckDetailView deck={deck} canEdit={user?.id === deck.ownerId} />
    </>
  );
}
