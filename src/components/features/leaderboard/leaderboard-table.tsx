"use client";

import { useTranslations } from "next-intl";
import { LoadingOutlined, MinusOutlined, FallOutlined, RiseOutlined, TrophyOutlined } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { cn, formatDuration, formatNumber } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

const RANK_STYLES: Record<number, string> = {
  1: "bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed-dim",
  2: "bg-surface-container-high text-on-surface border-outline-variant",
  3: "bg-primary-fixed text-on-primary-fixed-variant border-primary-fixed-dim",
};

/** Bảng xếp hạng — cuộn vô hạn (hiện dần 15 dòng mỗi lần), không phân trang số. */
export function LeaderboardTable({
  entries,
  highlightStudentId,
  scoreLabel,
  showTime = true,
}: {
  entries: LeaderboardEntry[];
  highlightStudentId?: string;
  /** Nhãn cột điểm — người gọi truyền vào đã dịch sẵn (vd `t("dash.common.points")`). */
  scoreLabel: string;
  showTime?: boolean;
}) {
  const t = useTranslations("dash.leaderboard");
  const tc = useTranslations("dash.common");
  const { visible, sentinelRef, hasMore } = useInfiniteScroll(entries, { pageSize: 15 });

  const trendLabel = (trend: NonNullable<LeaderboardEntry["trend"]>) =>
    trend === "up" ? t("rankUp") : trend === "down" ? t("rankDown") : t("rankSame");

  return (
    <>
      <ol className="flex flex-col gap-2">
        {visible.map((entry) => {
          const isSelf = entry.studentId === highlightStudentId;
          const rankStyle = RANK_STYLES[entry.rank];

          return (
            <li
              key={entry.studentId}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-3 transition-colors",
                isSelf ? "border-primary bg-primary-container/10" : "border-outline-variant/50 bg-surface",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-heading text-label-md font-bold",
                  rankStyle ?? "border-outline-variant bg-surface-container text-on-surface-variant",
                )}
              >
                {entry.rank <= 3 ? <TrophyOutlined className="text-base" /> : entry.rank}
              </div>
              <Avatar name={entry.studentName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-label-md text-label-md text-on-surface">
                  {entry.studentName} {isSelf ? <span className="text-primary">({tc("you")})</span> : null}
                </p>
                {showTime && entry.timeTakenSeconds > 0 ? (
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{formatDuration(entry.timeTakenSeconds)}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="font-heading text-headline-sm text-on-surface">{formatNumber(entry.score)}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{scoreLabel}</p>
              </div>
              {entry.trend ? (
                <span aria-label={trendLabel(entry.trend)}>
                  {entry.trend === "up" ? (
                    <RiseOutlined className="shrink-0 text-base text-secondary" />
                  ) : entry.trend === "down" ? (
                    <FallOutlined className="shrink-0 text-base text-error" />
                  ) : (
                    <MinusOutlined className="shrink-0 text-base text-outline" />
                  )}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-3 text-on-surface-variant" aria-hidden="true">
          <LoadingOutlined spin className="text-lg" />
        </div>
      ) : null}
    </>
  );
}
