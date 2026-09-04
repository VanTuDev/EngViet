import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FileTextOutlined, CopyOutlined, TeamOutlined } from "@/components/icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentRosterTable } from "@/components/features/classes/student-roster-table";
import { AssignmentCard } from "@/components/features/assignments/assignment-card";
import { ClassQrButton } from "@/components/features/classes/class-qr-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { buildPrivateMetadata } from "@/lib/seo";
import { getClass, getClassPerformance, getClassRoster } from "@/lib/api/classes";
import { getAssignments } from "@/lib/api/assignments";

export async function generateMetadata({ params }: { params: Promise<{ classId: string }> }): Promise<Metadata> {
  const { classId } = await params;
  const classRoom = await getClass(classId);
  const t = await getTranslations("dash.teacher.classDetail");
  return buildPrivateMetadata(classRoom ? classRoom.name : t("metaFallback"));
}

export default async function TeacherClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const classRoom = await getClass(classId);
  if (!classRoom) notFound();

  const t = await getTranslations("dash.teacher.classDetail");
  const tc = await getTranslations("dash.common");
  const tNav = await getTranslations("nav");

  const [students, assignments, performance] = await Promise.all([
    getClassRoster(classId),
    getAssignments(classId),
    getClassPerformance(classId),
  ]);

  return (
    <>
      <Breadcrumbs items={[{ label: tNav("teacherClasses"), href: "/teacher/classes" }, { label: classRoom.name }]} />

      <PageHeader
        title={classRoom.name}
        description={classRoom.description}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="gap-1.5 py-1.5 text-label-md">
              {tc("classCode", { code: classRoom.code })} <CopyOutlined />
            </Badge>
            <ClassQrButton roomName={classRoom.name} classCode={classRoom.code} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <SummaryTile label={tc("students")} value={students.length} />
        <SummaryTile label={tc("averageScore")} value={tc("scoreOutOf", { score: performance.averageScore })} />
        <SummaryTile label={tc("completionRate")} value={`${performance.completionRate}%`} />
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">{t("studentsTab", { count: students.length })}</TabsTrigger>
          <TabsTrigger value="assignments">{t("assignmentsTab", { count: assignments.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <Card className="p-6">
            <StudentRosterTable students={students} />
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <Card className="p-6">
            {assignments.length === 0 ? (
              <EmptyState icon={FileTextOutlined} title={t("emptyAssignmentsTitle")} description={t("emptyAssignmentsDesc")} />
            ) : (
              <div className="flex flex-col gap-3">
                {assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} classLabel={classRoom.name} href={`/teacher/assignments/${assignment.id}`} />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function SummaryTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/10 text-xl text-primary">
        <TeamOutlined />
      </div>
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
        <p className="font-heading text-headline-sm text-on-surface">{value}</p>
      </div>
    </Card>
  );
}
