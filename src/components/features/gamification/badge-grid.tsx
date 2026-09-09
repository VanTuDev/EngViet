import { getFormatter, getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EarnedBadge } from "@/lib/types";
import { ALL_BADGE_CODES, BADGE_META } from "@/components/features/gamification/badge-meta";

/** Every achievement — earned ones lit up with the date, the rest greyed out as goals to chase. */
export async function BadgeGrid({ earned }: { earned: EarnedBadge[] }) {
  const t = await getTranslations("dash.gamification");
  const format = await getFormatter();
  const earnedAt = new Map(earned.map((b) => [b.code, b.earnedAt]));

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-heading text-headline-sm text-on-surface">{t("badgesTitle")}</h3>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {t("badgesProgress", { earned: earned.length, total: ALL_BADGE_CODES.length })}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ALL_BADGE_CODES.map((code) => {
          const meta = BADGE_META[code];
          const Icon = meta.icon;
          const when = earnedAt.get(code);
          const unlocked = Boolean(when);
          return (
            <li
              key={code}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                unlocked ? "border-outline-variant bg-surface-container-lowest" : "border-dashed border-outline-variant/60 opacity-55",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-xl",
                  unlocked ? meta.tone : "bg-surface-variant text-on-surface-variant",
                )}
              >
                <Icon />
              </span>
              <span className="font-label-md text-label-md text-on-surface">{t(`badges.${code}.name`)}</span>
              <span className="line-clamp-2 font-label-sm text-[11px] leading-tight text-on-surface-variant">
                {t(`badges.${code}.desc`)}
              </span>
              {when ? (
                <span className="font-label-sm text-[10px] text-on-surface-variant/70">
                  {format.dateTime(new Date(when), { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
