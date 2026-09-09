import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GamePlay } from "@/components/features/games/game-play";
import { buildPrivateMetadata } from "@/lib/seo";
import { getGameSessionByPin } from "@/lib/api/games";
import { getCurrentUser } from "@/lib/api/session";

export async function generateMetadata({ params }: { params: Promise<{ pin: string }> }): Promise<Metadata> {
  const { pin } = await params;
  const session = await getGameSessionByPin(pin);
  const t = await getTranslations("dash.games.play");
  return buildPrivateMetadata(session ? t("metaPlaying", { title: session.title }) : t("metaFallback"));
}

export default async function StudentGamePlayPage({ params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const [session, user] = await Promise.all([getGameSessionByPin(pin), getCurrentUser()]);
  if (!session || !user) notFound();

  return <GamePlay pin={pin} title={session.title} user={user} />;
}
