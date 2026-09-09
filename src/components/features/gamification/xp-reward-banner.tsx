"use client";

import { useTranslations } from "next-intl";
import { RiseOutlined, ThunderboltOutlined } from "@/components/icons";
import { Confetti } from "@/components/motion/confetti";
import { BADGE_META, UNKNOWN_BADGE_META } from "@/components/features/gamification/badge-meta";
import { isBadgeCode } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import type { XpReward } from "@/lib/types";

/**
 * The "+50 XP", "Lên cấp!" and new-badge celebration shown on a quiz / matching / game result
 * screen. Pass the `xp` field the submit response carries. Renders nothing when no XP was awarded.
 */
export function XpRewardBanner({ reward, seedKey }: { reward?: XpReward | null; seedKey?: string }) {
  const t = useTranslations("dash.gamification");
  if (!reward || reward.awarded <= 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center",
        reward.leveledUp ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-lowest",
      )}
    >
      {reward.leveledUp ? <Confetti seedKey={seedKey ?? "xp-levelup"} count={70} /> : null}

      <p className="flex items-center gap-1.5 font-heading text-headline-md tabular-nums text-primary">
        <ThunderboltOutlined /> +{reward.awarded} XP
        {reward.multiplier > 1 ? (
          <span className="rounded-full bg-tertiary/15 px-2 py-0.5 font-label-sm text-label-sm text-tertiary">
            ×{reward.multiplier % 1 === 0 ? reward.multiplier : reward.multiplier.toFixed(1)}
          </span>
        ) : null}
      </p>

      {reward.leveledUp ? (
        <p className="flex items-center gap-1.5 font-heading text-headline-sm text-primary">
          <RiseOutlined /> {t("leveledUp", { level: reward.level })}
        </p>
      ) : null}

      {reward.newBadges.length > 0 ? (
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {reward.newBadges.map((code) => {
            const meta = isBadgeCode(code) ? BADGE_META[code] : UNKNOWN_BADGE_META;
            const Icon = meta.icon;
            return (
              <span
                key={code}
                className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm", meta.tone)}
              >
                <Icon /> {isBadgeCode(code) ? t(`badges.${code}.name`) : t("newBadgeGeneric")}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
