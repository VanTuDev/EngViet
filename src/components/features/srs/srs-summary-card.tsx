import { getTranslations } from "next-intl/server";
import { ArrowRightOutlined, FireOutlined, ReadOutlined } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { SrsSummary } from "@/lib/types";

/**
 * Student-dashboard widget for the spaced-repetition habit. Server Component — the summary is
 * fetched in the dashboard page and passed in. Three states: cards due (primary CTA), all caught
 * up (streak celebration), or no deck yet (quiet hint).
 */
export async function SrsSummaryCard({ summary }: { summary: SrsSummary | null }) {
  const t = await getTranslations("dash.srs");
  if (!summary) return null;

  const { dueCount, totalCards, streak } = summary;
  const hasDeck = totalCards > 0;

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container/20 text-xl text-tertiary">
            <ReadOutlined />
          </div>
          <h3 className="font-heading text-headline-md text-on-surface">{t("widgetTitle")}</h3>
        </div>
        {streak.current > 0 ? (
          <span className="flex items-center gap-1 font-label-md text-label-md text-tertiary">
            <FireOutlined /> {t("streakDays", { count: streak.current })}
          </span>
        ) : null}
      </div>

      {!hasDeck ? (
        <p className="text-body-md text-on-surface-variant">{t("widgetEmpty")}</p>
      ) : dueCount > 0 ? (
        <>
          <p className="text-body-md text-on-surface-variant">
            <span className="font-heading text-headline-sm text-primary">{dueCount}</span> {t("widgetDue", { count: dueCount })}
          </p>
          <Link
            href="/student/review"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary/90"
          >
            {t("widgetStart")} <ArrowRightOutlined />
          </Link>
        </>
      ) : (
        <>
          <p className="text-body-md text-on-surface-variant">{t("widgetCaughtUp", { total: totalCards })}</p>
          <Link
            href="/student/review"
            className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-variant/50"
          >
            {t("widgetReviewAgain")}
          </Link>
        </>
      )}
    </Card>
  );
}
