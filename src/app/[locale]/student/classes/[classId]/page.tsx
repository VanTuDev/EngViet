import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FileTextOutlined, TrophyOutlined, UserOutlined } from "@/components/icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentCard } from "@/components/features/assignments/assignment-card";
import { LeaderboardTable } from "@/components/features/leaderboard/leaderboard-table";
import { EmptyState } from "@/components/ui/empty-state";
import { buildPrivateMetadata } from "@/lib/seo";
import { getClass } from "@/lib/api/classes";
import { getAssignments } from "@/lib/api/assignments";
import { getClassLeaderboard } from "@/lib/api/leaderboard";
import { getCurrentUser } from "@/lib/api/session";

export async function generateMetadata({ params }: { params: Promise<{ classId: string }> }): Promise<Metadata> {
  const { classId } = await params;
  const classRoom = await getClass(classId);
  const t = await getTranslations("dash.student.classDetail");
  return buildPrivateMetadata(classRoom ? classRoom.name : t("metaFallback"));
}

export default async function StudentClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const [classRoom, user] = await Promise.all([getClass(classId), getCurrentUser()]);
  if (!classRoom) notFound();

  const t = await getTranslations("dash.student.classDetail");
  const tc = await getTranslations("dash.common");
  const tNav = await getTranslations("nav");

  let assignments: Awaited<ReturnType<typeof getAssignments>> = [];
  try {
    assignments = await getAssignments(classId);
  } catch {
    notFound(); // not enrolled → backend 403
  }
  const leaderboard = await getClassLeaderboard(classId);

  return (
    <>
      <Breadcrumbs items={[{ label: tNav("studentClasses"), href: "/student/classes" }, { label: classRoom.name }]} />

      <PageHeader
        title={classRoom.name}
        description={classRoom.description}
        actions={
          <Badge variant="outline" className="gap-1.5 py-1.5 text-label-md">
            <UserOutlined /> {tc("teacherPrefix", { name: classRoom.teacherName ?? "" })}
          </Badge>
        }
      />

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments">{t("assignmentsTab", { count: assignments.length })}</TabsTrigger>
          <TabsTrigger value="leaderboard">{t("leaderboardTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-4">
          <Card className="p-6">
            {assignments.length === 0 ? (
              <EmptyState icon={FileTextOutlined} title={t("emptyAssignmentsTitle")} description={t("emptyAssignmentsDesc")} />
            ) : (
              <div className="flex flex-col gap-3">
                {assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} classLabel={classRoom.name} href={`/student/assignments/${assignment.id}`} />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card className="p-6">
            {leaderboard.length === 0 ? (
              <EmptyState icon={TrophyOutlined} title={t("emptyLeaderboard")} />
            ) : (
              <LeaderboardTable entries={leaderboard} highlightStudentId={user?.id} scoreLabel={tc("xp")} showTime={false} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
