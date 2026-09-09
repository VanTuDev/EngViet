import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { LevelBadge } from "@/components/features/gamification/level-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { FireOutlined, ReadOutlined, TeamOutlined, WarningOutlined } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { ClassRoom, SrsInsights } from "@/lib/types";

/**
 * Teacher's vocabulary-retention view for one class: how many students are actually reviewing,
 * which words the class keeps forgetting, the streak leaders, and who's fallen behind. Server
 * Component — all data comes from `getSrsInsights`; the only interactive part is the class picker.
 */
export async function SrsInsightsView({
  classes,
  activeClassId,
  insights,
}: {
  classes: ClassRoom[];
  activeClassId: string;
  insights: SrsInsights | null;
}) {
  const t = await getTranslations("dash.srs.insights");

  return (
    <div className="flex flex-col gap-gutter">
      {classes.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/vocabulary?classId=${c.id}`}
              className={
                c.id === activeClassId
                  ? "rounded-full bg-primary px-3.5 py-1.5 font-label-sm text-label-sm text-on-primary"
                  : "rounded-full bg-surface-container px-3.5 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-variant"
              }
            >
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}

      {!insights ? (
        <EmptyState icon={ReadOutlined} title={t("noData")} description={t("noDataHint")} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
            <Stat label={t("statStudents")} value={`${insights.totalStudents}`} icon={<TeamOutlined />} />
            <Stat
              label={t("statActive")}
              value={`${insights.activeLearners}`}
              hint={t("statActiveHint", { total: insights.totalStudents })}
              icon={<ReadOutlined />}
            />
            <Stat label={t("statReviewedToday")} value={`${insights.reviewedTodayCount}`} icon={<FireOutlined />} />
            <Stat label={t("statNeedNudge")} value={`${insights.needNudge.length}`} icon={<WarningOutlined />} />
          </div>

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-1 font-heading text-headline-sm text-on-surface">{t("hardestTitle")}</h3>
              <p className="mb-4 text-body-sm text-on-surface-variant">{t("hardestHint")}</p>
              {insights.hardestWords.length === 0 ? (
                <p className="py-6 text-center text-body-sm text-on-surface-variant">{t("hardestEmpty")}</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {insights.hardestWords.map((w) => {
                    const strugglePct = w.learners > 0 ? Math.round((w.strugglingLearners / w.learners) * 100) : 0;
                    return (
                      <li key={w.word} className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-label-md text-label-md text-on-surface">
                            {w.word} <span className="text-on-surface-variant">· {w.meaning}</span>
                          </span>
                          <span className="shrink-0 font-label-sm text-label-sm text-error">
                            {t("lapses", { count: w.totalLapses })}
                          </span>
                        </div>
                        <Progress value={strugglePct} max={100} tone={strugglePct >= 60 ? "error" : "primary"} />
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {t("strugglingOf", { struggling: w.strugglingLearners, learners: w.learners })}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Card>

            <div className="flex flex-col gap-gutter">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-heading text-headline-sm text-on-surface">
                  <FireOutlined className="text-tertiary" /> {t("streakTitle")}
                </h3>
                {insights.streakLeaders.length === 0 ? (
                  <p className="py-4 text-center text-body-sm text-on-surface-variant">{t("streakEmpty")}</p>
                ) : (
                  <ol className="flex flex-col gap-2">
                    {insights.streakLeaders.map((row, i) => (
                      <li key={row.studentId} className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2">
                        <span className="flex min-w-0 items-center gap-1.5 font-label-md text-label-md text-on-surface">
                          <span className="shrink-0 text-on-surface-variant">#{i + 1}</span>
                          <span className="truncate">{row.studentName}</span>
                          {row.level > 1 ? <LevelBadge level={row.level} showTitle={false} size="sm" /> : null}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 font-label-md text-label-md text-tertiary">
                          <FireOutlined /> {row.currentStreak}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="mb-1 flex items-center gap-2 font-heading text-headline-sm text-on-surface">
                  <WarningOutlined className="text-tertiary" /> {t("nudgeTitle")}
                </h3>
                <p className="mb-4 text-body-sm text-on-surface-variant">{t("nudgeHint")}</p>
                {insights.needNudge.length === 0 ? (
                  <p className="py-4 text-center text-body-sm text-on-surface-variant">{t("nudgeEmpty")}</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {insights.needNudge.map((row) => (
                      <li key={row.studentId} className="flex items-center justify-between rounded-lg bg-surface-container-lowest px-3 py-2">
                        <span className="font-label-md text-label-md text-on-surface">{row.studentName}</span>
                        <span className="font-label-sm text-label-sm text-error">{t("dueCards", { count: row.dueCount })}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: ReactNode }) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
        <span className="text-base text-primary">{icon}</span> {label}
      </span>
      <span className="font-heading text-headline-md text-on-surface">{value}</span>
      {hint ? <span className="font-label-sm text-label-sm text-on-surface-variant/80">{hint}</span> : null}
    </Card>
  );
}
