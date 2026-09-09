import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewSession } from "@/components/features/srs/review-session";
import { buildPrivateMetadata } from "@/lib/seo";
import { getSrsReviewQueue } from "@/lib/api/srs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.srs");
  return buildPrivateMetadata(t("meta"));
}

export default async function StudentReviewPage() {
  const t = await getTranslations("dash.srs");
  const queue = await getSrsReviewQueue();

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <ReviewSession initial={queue} />
    </>
  );
}
