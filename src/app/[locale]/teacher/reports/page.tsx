import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRightOutlined, BarChartOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buildPrivateMetadata } from "@/lib/seo";
import { getClassPerformance, getMyClasses } from "@/lib/api/classes";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.teacher.reports");
  return buildPrivateMetadata(t("meta"));
}

export default async function TeacherReportsPage() {
  const t = await getTranslations("dash.teacher.reports");
  const tc = await getTranslations("dash.common");
  const classes = await getMyClasses("owned");
  const summaries = await Promise.all(
    classes.map(async (classRoom) => ({ classRoom, summary: await getClassPerformance(classRoom.id) })),
  );

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {summaries.map(({ classRoom, summary }) => (
          <Card key={classRoom.id} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/10 text-xl text-primary">
                  <BarChartOutlined />
                </div>
                <div>
                  <h3 className="font-heading text-headline-sm text-on-surface">{classRoom.name}</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {t("classSummary", { students: summary.totalStudents, assignments: summary.totalAssignments })}
                  </p>
                </div>
              </div>
              <Link
                href={`/teacher/classes/${classRoom.id}`}
                className="flex items-center gap-1 font-label-md text-label-md text-primary hover:underline"
              >
                {tc("details")} <ArrowRightOutlined />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{tc("averageScore")}</span>
                  <span className="font-label-md text-label-md text-on-surface">{tc("scoreOutOf", { score: summary.averageScore })}</span>
                </div>
                <Progress value={summary.averageScore} max={100} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{tc("completionRate")}</span>
                  <span className="font-label-md text-label-md text-on-surface">{summary.completionRate}%</span>
                </div>
                <Progress value={summary.completionRate} max={100} tone="success" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
