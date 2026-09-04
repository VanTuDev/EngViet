import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import {
  ArrowRightOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  ReadOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LazyBarChart } from "@/components/features/charts/bar-chart.lazy";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses, getTeacherActivity, getTeacherSummary } from "@/lib/api/classes";
import { currentTimestamp } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.teacher");
  return buildPrivateMetadata(t("metaDashboard"));
}

const ACTIVITY_TONE: Record<string, string> = {
  join: "bg-secondary",
  submission: "bg-primary",
  assignment: "bg-tertiary",
};

export default async function TeacherDashboardPage() {
  const t = await getTranslations("dash.teacher");
  const tc = await getTranslations("dash.common");
  const format = await getFormatter();

  const [summary, classes, activity] = await Promise.all([
    getTeacherSummary(),
    getMyClasses(),
    getTeacherActivity(),
  ]);

  const { slotsUsed, slotsTotal } = summary.subscription;
  const slotPct = slotsTotal > 0 ? Math.round((slotsUsed / slotsTotal) * 100) : 0;
  const now = currentTimestamp();

  return (
    <>
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <StatCard
          label={t("stats.totalStudents")}
          value={slotsUsed}
          suffix={`/${slotsTotal}`}
          icon={TeamOutlined}
          footer={
            <div className="mt-2">
              <Progress value={slotsUsed} max={slotsTotal} />
              <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
                {t("stats.slotsUsedPct", { pct: slotPct })}
              </p>
            </div>
          }
        />
        <StatCard
          label={t("stats.activeClasses")}
          value={summary.activeClasses}
          icon={ReadOutlined}
          tone="secondary"
          footer={
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <Badge key={c.id} variant="neutral">
                  {c.name}
                </Badge>
              ))}
            </div>
          }
        />
        <StatCard
          label={t("stats.newStudents7d")}
          value={summary.newStudents7d}
          icon={UserAddOutlined}
          tone="error"
          footer={
            <Link
              href="/teacher/classes"
              className="flex items-center gap-1 font-label-md text-label-md text-primary hover:underline"
            >
              {tc("viewNow")} <ArrowRightOutlined />
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <Card className="flex h-80 flex-col p-6 md:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-headline-md text-on-surface">{t("slotTrend")}</h3>
          </div>
          <div className="flex-1">
            <LazyBarChart data={summary.slotUsageTrend.map((p) => ({ label: p.label, value: p.count }))} />
          </div>
        </Card>

        <div className="flex flex-col gap-gutter md:col-span-4">
          <Card className="p-6">
            <h3 className="mb-4 font-heading text-headline-md text-on-surface">{t("quickActions")}</h3>
            <div className="flex flex-col gap-3">
              <Link
                href="/teacher/classes"
                className="flex items-center gap-3 rounded-lg border border-primary/20 bg-surface-container px-4 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-surface-variant"
              >
                <FolderAddOutlined /> {t("createClass")}
              </Link>
              <Link
                href="/teacher/assignments/new"
                className="flex items-center gap-3 rounded-lg border border-primary/20 bg-surface-container px-4 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-surface-variant"
              >
                <FileAddOutlined /> {t("newAssignment")}
              </Link>
            </div>
          </Card>

          <Card className="flex-1 p-6">
            <h3 className="mb-4 font-heading text-headline-md text-on-surface">{t("recentActivity")}</h3>
            <CardContent className="relative flex flex-col gap-6 border-l-2 border-surface-variant p-0 pl-4">
              {activity.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">{t("activityEmpty")}</p>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="relative">
                    <div
                      className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-surface-container-lowest ${
                        ACTIVITY_TONE[item.type] ?? "bg-surface-variant"
                      }`}
                    />
                    <p className="text-body-md text-on-surface">{item.text}</p>
                    <p className="mt-1 font-label-sm text-label-sm text-outline">
                      {format.relativeTime(new Date(item.at), now)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
