import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { ClockCircleOutlined, CheckSquareOutlined, BlockOutlined, FieldTimeOutlined, TrophyOutlined, TeamOutlined } from "@/components/icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaderboardTable } from "@/components/features/leaderboard/leaderboard-table";
import { ExportResultsButton } from "@/components/features/assignments/export-results-button";
import { AssignmentQrButton } from "@/components/features/assignments/assignment-qr-modal";
import { buildPrivateMetadata } from "@/lib/seo";
import { getAssignment } from "@/lib/api/assignments";
import { getClass, getClassPerformance } from "@/lib/api/classes";
import { getAssignmentLeaderboard } from "@/lib/api/leaderboard";
import type { IconType } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ assignmentId: string }> }): Promise<Metadata> {
  const { assignmentId } = await params;
  const assignment = await getAssignment(assignmentId);
  const t = await getTranslations("dash.teacher.report");
  return buildPrivateMetadata(assignment ? assignment.title : t("metaFallback"));
}

export default async function TeacherAssignmentReportPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const assignment = await getAssignment(assignmentId);
  if (!assignment) notFound();

  const t = await getTranslations("dash.teacher.report");
  const tc = await getTranslations("dash.common");
  const tNav = await getTranslations("nav");
  const format = await getFormatter();

  const [classRoom, performance, leaderboard] = await Promise.all([
    getClass(assignment.classId),
    getClassPerformance(assignment.classId),
    getAssignmentLeaderboard(assignmentId),
  ]);

  const isQuiz = assignment.mode === "quiz";
  const totalStudents = performance.totalStudents;
  const submittedCount = leaderboard.length;
  const submissionRate = totalStudents ? Math.round((submittedCount / totalStudents) * 100) : 0;
  const averageScore = submittedCount
    ? Math.round(leaderboard.reduce((sum, r) => sum + r.score, 0) / submittedCount)
    : 0;
  const deadlineStr = format.dateTime(new Date(assignment.deadline), { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <Breadcrumbs
        items={[
          { label: tNav("teacherAssignments"), href: "/teacher/assignments" },
          { label: assignment.title },
        ]}
      />

      <PageHeader
        title={assignment.title}
        description={classRoom?.name}
        actions={
          <div className="flex items-center gap-3">
            <AssignmentQrButton title={assignment.title} assignmentId={assignment.id} mode={assignment.mode} />
            <ExportResultsButton results={leaderboard} fileName={`ket-qua-${assignment.id}`} />
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Badge variant={isQuiz ? "primary" : "success"} className="gap-1.5 py-1.5 text-label-md">
          {isQuiz ? <CheckSquareOutlined /> : <BlockOutlined />}
          {isQuiz ? tc("quizFull") : tc("matchingFull")}
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 text-label-md">
          <ClockCircleOutlined /> {tc("deadline", { date: deadlineStr })}
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5 text-label-md">
          <FieldTimeOutlined /> {assignment.durationSeconds}s
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <SummaryTile icon={TeamOutlined} label={t("submittedTile")} value={`${submittedCount}/${totalStudents}`} />
        <SummaryTile icon={TrophyOutlined} label={tc("averageScore")} value={tc("scoreOutOf", { score: averageScore })} />
        <SummaryTile icon={CheckSquareOutlined} label={tc("completionRate")} value={`${submissionRate}%`} />
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-heading text-headline-md text-on-surface">{t("leaderboard")}</h3>
        {leaderboard.length === 0 ? (
          <EmptyState icon={TrophyOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />
        ) : (
          <LeaderboardTable entries={leaderboard} scoreLabel={tc("points")} />
        )}
      </Card>
    </>
  );
}

function SummaryTile({ icon: Icon, label, value }: { icon: IconType; label: string; value: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/10 text-xl text-primary">
        <Icon />
      </div>
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
        <p className="font-heading text-headline-sm text-on-surface">{value}</p>
      </div>
    </Card>
  );
}
