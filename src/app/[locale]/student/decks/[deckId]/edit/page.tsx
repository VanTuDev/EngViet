import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { DeckForm } from "@/components/features/decks/deck-form";
import { buildPrivateMetadata } from "@/lib/seo";
import { getDeck } from "@/lib/api/decks";
import { getMyClasses } from "@/lib/api/classes";
import { getCurrentUser } from "@/lib/api/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.decks.edit");
  return buildPrivateMetadata(t("meta"));
}

export default async function EditDeckPage({
  params,
}: {
  params: Promise<{ locale: string; deckId: string }>;
}) {
  const { locale, deckId } = await params;
  const [deck, user] = await Promise.all([getDeck(deckId), getCurrentUser()]);
  if (!deck) notFound();
  if (user?.id !== deck.ownerId) redirect({ href: `/student/decks/${deckId}`, locale });

  const t = await getTranslations("dash.decks.edit");
  const tNav = await getTranslations("nav");
  const owned = await getMyClasses("owned").catch(() => []);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: tNav("studentDecks"), href: "/student/decks" },
          { label: deck.title, href: `/student/decks/${deck.id}` },
          { label: t("title") },
        ]}
      />
      <PageHeader title={t("title")} description={t("desc")} />
      <DeckForm mode="edit" deck={deck} ownedClasses={owned.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
