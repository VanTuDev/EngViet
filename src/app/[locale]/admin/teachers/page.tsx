import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { buildPrivateMetadata } from "@/lib/seo";
import { getTeacherOverviews } from "@/lib/api/admin";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.admin.teachers");
  return buildPrivateMetadata(t("meta"));
}

export default async function AdminTeachersPage() {
  const t = await getTranslations("dash.admin.teachers");
  const tc = await getTranslations("dash.common");
  const teachers = await getTeacherOverviews();

  return (
    <>
      <PageHeader title={t("title")} description={t("desc", { count: teachers.length })} />

      <Card className="p-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t("colTeacher")}</TableHeaderCell>
              <TableHeaderCell>{t("colPlan")}</TableHeaderCell>
              <TableHeaderCell>{t("colSlots")}</TableHeaderCell>
              <TableHeaderCell>{t("colClasses")}</TableHeaderCell>
              <TableHeaderCell>{t("colStatus")}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>
                  <Link href={`/admin/teachers/${teacher.id}`} className="flex items-center gap-3 hover:underline">
                    <Avatar name={teacher.fullName} size="sm" />
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{teacher.fullName}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{teacher.email}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{teacher.planId ?? "free"}</TableCell>
                <TableCell className="min-w-[140px]">
                  <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">
                    {teacher.slotsUsed}/{teacher.slotsTotal}
                  </p>
                  <Progress value={teacher.slotsUsed} max={teacher.slotsTotal} className="h-1.5" />
                </TableCell>
                <TableCell>{teacher.classCount}</TableCell>
                <TableCell>
                  <Badge variant={teacher.isActive ? "success" : "error-soft"}>
                    {teacher.isActive ? tc("statusActive") : tc("statusSuspended")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
