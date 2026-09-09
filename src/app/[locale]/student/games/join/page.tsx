import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card } from "antd";
import { ThunderboltOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { GameJoinForm } from "@/components/features/games/game-join-form";
import { buildPrivateMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.games.join");
  return buildPrivateMetadata(t("meta"));
}

export default async function StudentGameJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string }>;
}) {
  const { pin } = await searchParams;
  const t = await getTranslations("dash.games.join");

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <Card className="mx-auto max-w-md p-8">
        <div className="mb-4 flex justify-center text-4xl text-primary">
          <ThunderboltOutlined />
        </div>
        <GameJoinForm initialPin={pin} />
      </Card>
    </>
  );
}
