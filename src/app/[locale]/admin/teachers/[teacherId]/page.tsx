import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ReadOutlined, MailOutlined } from "@/components/icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buildPrivateMetadata } from "@/lib/seo";
import { getTeacherOverviews } from "@/lib/api/admin";

export async function generateMetadata({ params }: { params: Promise<{ teacherId: string }> }): Promise<Metadata> {
  const { teacherId } = await params;
  const teachers = await getTeacherOverviews();
  const teacher = teachers.find((tc) => tc.id === teacherId);
  const t = await getTranslations("dash.admin.teacherDetail");
  return buildPrivateMetadata(teacher ? teacher.fullName : t("metaFallback"));
}

export default async function AdminTeacherDetailPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  const teachers = await getTeacherOverviews();
  const teacher = teachers.find((tc) => tc.id === teacherId);
  if (!teacher) notFound();

  const t = await getTranslations("dash.admin.teacherDetail");
  const tc = await getTranslations("dash.common");
  const tNav = await getTranslations("nav");

  return (
    <>
      <Breadcrumbs items={[{ label: tNav("adminTeachers"), href: "/admin/teachers" }, { label: teacher.fullName }]} />

      <PageHeader
        title={teacher.fullName}
        description={teacher.email}
        actions={
          <Badge variant={teacher.isActive ? "success" : "error-soft"}>
            {teacher.isActive ? tc("statusActive") : tc("statusSuspended")}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <Card className="flex items-center gap-4 p-6 md:col-span-1">
          <Avatar name={teacher.fullName} size="lg" />
          <div>
            <p className="font-heading text-headline-sm text-on-surface">{teacher.fullName}</p>
            <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
              <MailOutlined /> {teacher.email}
            </p>
            <Badge variant="outline" className="mt-2 capitalize">
              {t("planBadge", { plan: teacher.planId ?? "free" })}
            </Badge>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">{t("studentSlots")}</span>
            <span className="font-label-md text-label-md text-on-surface">
              {teacher.slotsUsed}/{teacher.slotsTotal}
            </span>
          </div>
          <Progress value={teacher.slotsUsed} max={teacher.slotsTotal} />
          <p className="mt-4 flex items-center gap-2 text-body-sm text-on-surface-variant">
            <ReadOutlined /> {t("managingClasses", { count: teacher.classCount })}
          </p>
        </Card>
      </div>
    </>
  );
}
