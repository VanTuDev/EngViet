import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@/components/icons";
import { Link } from "@/i18n/navigation";

/**
 * Pager for the exam schedule: every view is a fixed 2-week block (`SCHEDULE_WINDOW_DAYS`),
 * navigated by whole blocks via `?offset=` — a plain server-side navigation (not client
 * state), since moving a week re-fetches a different `?from=&to=` range from the backend.
 */
export async function ScheduleWeekNav({
  from,
  to,
  weekOffset,
  basePath,
}: {
  from: Date;
  to: Date;
  weekOffset: number;
  basePath: string;
}) {
  const t = await getTranslations("dash.schedule");
  const format = await getFormatter();
  const lastDay = new Date(to);
  lastDay.setDate(lastDay.getDate() - 1);
  // Both sides get the same options (year included on both) so the locale can't pick a
  // different separator per skeleton — `vi-VN` renders "day+month" alone with dashes but
  // "day+month+year" with slashes, which otherwise reads as an inconsistent "31-08 – 13/09/2026".
  const dateOpts = { day: "2-digit", month: "2-digit", year: "numeric" } as const;
  const rangeLabel = `${format.dateTime(from, dateOpts)} – ${format.dateTime(lastDay, dateOpts)}`;

  const navLinkClass =
    "flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-variant";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Link href={`${basePath}?offset=${weekOffset - 1}`} className={navLinkClass} aria-label={t("prevWeeks")}>
          <ArrowLeftOutlined /> {t("prevWeeks")}
        </Link>
        <Link href={`${basePath}?offset=${weekOffset + 1}`} className={navLinkClass} aria-label={t("nextWeeks")}>
          {t("nextWeeks")} <ArrowRightOutlined />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-label-md text-label-md text-on-surface">{rangeLabel}</span>
        {weekOffset !== 0 ? (
          <Link
            href={basePath}
            className="rounded-full bg-primary-container/20 px-3 py-1.5 font-label-sm text-label-sm text-primary transition-colors hover:bg-primary-container/30"
          >
            {t("backToToday")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
