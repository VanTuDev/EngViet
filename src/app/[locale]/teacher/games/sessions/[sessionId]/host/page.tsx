import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { HostRoom } from "@/components/features/games/host-room";
import { buildPrivateMetadata } from "@/lib/seo";
import { getGameSession } from "@/lib/api/games";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await getGameSession(sessionId);
  const t = await getTranslations("dash.games.host");
  return buildPrivateMetadata(session ? t("metaHosting", { title: session.title }) : t("metaFallback"));
}

export default async function HostGameSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const t = await getTranslations("dash.games.host");
  const session = await getGameSession(sessionId);
  if (!session) notFound();

  return (
    <>
      <PageHeader title={session.title} description={t("pageDesc")} />
      <HostRoom pin={session.pin} />
    </>
  );
}
