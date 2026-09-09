"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * The small "Lv 3 · Học viên chăm chỉ" chip shown next to a name — in the class leaderboard,
 * the live game room, the SRS insights table and the profile page. Client component (needs
 * `useTranslations` for the title label); safe to drop into a Server Component as a leaf.
 */
export function LevelBadge({
  level,
  title,
  showTitle = true,
  size = "md",
  className,
}: {
  level: number;
  /** Title code (e.g. `"diligent"`); resolved to a label here. */
  title?: string;
  showTitle?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const t = useTranslations("dash.gamification");
  const titleLabel = showTitle && title ? t(`titles.${title}`) : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/10 font-label-sm font-semibold text-primary",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        className,
      )}
    >
      <span className="tabular-nums">{t("levelShort", { level })}</span>
      {titleLabel ? (
        <>
          <span className="text-primary/40" aria-hidden="true">
            ·
          </span>
          <span className="font-medium text-primary/90">{titleLabel}</span>
        </>
      ) : null}
    </span>
  );
}
