import { getTranslations } from "next-intl/server";
import { FireOutlined, ReadOutlined, RiseOutlined, ThunderboltOutlined } from "@/components/icons";
import { Card } from "@/components/ui/card";
import type { GamificationSummary } from "@/lib/types";

/** The big "Cấp độ" panel on the profile page — level, XP-to-next progress, streak bonus + stats. */
export async function LevelProgressCard({ summary }: { summary: GamificationSummary }) {
  const t = await getTranslations("dash.gamification");
  const pct = summary.span > 0 ? Math.round((summary.levelXp / summary.span) * 100) : 100;

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-headline-sm font-bold text-on-primary">
            {summary.level}
          </div>
          <div>
            <p className="font-heading text-headline-sm text-on-surface">{t("levelTitle", { level: summary.level })}</p>
            <p className="text-body-sm text-on-surface-variant">{t("xpTotal", { xp: summary.xp })}</p>
          </div>
        </div>
        {summary.streakBonusActive ? (
          <span className="flex items-center gap-1 rounded-full bg-tertiary/10 px-2.5 py-1 font-label-sm text-label-sm text-tertiary">
            <ThunderboltOutlined /> {t("streakBonus")}
          </span>
        ) : null}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
          <span>{t("progressLabel")}</span>
          <span className="tabular-nums">{t("xpToNext", { xp: summary.toNext })}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-low">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat icon={<FireOutlined />} label={t("statStreak")} value={t("days", { count: summary.streakDays })} />
        <Stat icon={<ReadOutlined />} label={t("statMastered")} value={`${summary.masteredWords}`} />
        <Stat icon={<RiseOutlined />} label={t("statBadges")} value={`${summary.badges.length}`} />
      </div>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-surface-container-lowest p-3">
      <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
        <span className="text-primary">{icon}</span> {label}
      </span>
      <span className="font-heading text-headline-sm text-on-surface">{value}</span>
    </div>
  );
}
