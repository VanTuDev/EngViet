import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { ClockCircleOutlined, CheckSquareOutlined, PlayCircleOutlined, BlockOutlined, FieldTimeOutlined } from "@/components/icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPrivateMetadata } from "@/lib/seo";
import { getPlayableAssignment } from "@/lib/api/assignments";
import { getClass } from "@/lib/api/classes";
import { getMyResult } from "@/lib/api/submissions";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ assignmentId: string }> }): Promise<Metadata> {
  const { assignmentId } = await params;
  const assignment = await getPlayableAssignment(assignmentId);
  const t = await getTranslations("dash.student.intro");
  return buildPrivateMetadata(assignment ? assignment.title : t("metaFallback"));
}

export default async function StudentAssignmentIntroPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const assignment = await getPlayableAssignment(assignmentId);
  if (!assignment) notFound();

  const t = await getTranslations("dash.student.intro");
  const tc = await getTranslations("dash.common");
  const tNav = await getTranslations("nav");
  const format = await getFormatter();

  const [classRoom, existingResult] = await Promise.all([
    getClass(assignment.classId),
    getMyResult(assignmentId),
  ]);
  const isQuiz = assignment.mode === "quiz";
  const itemCount = isQuiz ? assignment.questions.length : assignment.vocabulary.length;
  const playHref = `/student/assignments/${assignment.id}/${isQuiz ? "quiz" : "matching"}`;
  const durationLabel =
    assignment.durationSeconds >= 60
      ? tc("durationMinutes", { count: Math.round(assignment.durationSeconds / 60) })
      : tc("durationSeconds", { count: assignment.durationSeconds });
  const deadlineStr = format.dateTime(new Date(assignment.deadline), { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <Breadcrumbs
        items={[
          { label: tNav("studentAssignments"), href: "/student/assignments" },
          { label: assignment.title },
        ]}
      />

      <Card className="mx-auto flex w-full max-w-focus flex-col items-center gap-4 p-6 text-center sm:p-10">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${isQuiz ? "bg-primary-container/15 text-primary" : "bg-secondary-container/30 text-secondary"}`}>
          {isQuiz ? <CheckSquareOutlined /> : <BlockOutlined />}
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant">{classRoom?.name}</p>
          <h1 className="mt-1 font-heading text-headline-lg text-on-surface">{assignment.title}</h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant={isQuiz ? "primary" : "success"} className="gap-1.5 py-1.5 text-label-md">
            {isQuiz ? tc("quizQuestions", { count: itemCount }) : tc("matchingWords", { count: itemCount })}
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 text-label-md">
            <FieldTimeOutlined /> {tc("durationLimit", { value: durationLabel })}
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 text-label-md">
            <ClockCircleOutlined /> {tc("deadline", { date: deadlineStr })}
          </Badge>
        </div>

        <p className="max-w-md text-body-md text-on-surface-variant">{isQuiz ? t("quizDesc") : t("matchingDesc")}</p>

        {existingResult ? (
          <Badge variant="success" className="mt-2 py-1.5 text-label-md">
            {tc("scoreOutOf", { score: existingResult.score })}
          </Badge>
        ) : (
          <Button asChild size="lg" className="mt-2">
            <Link href={playHref}>
              <PlayCircleOutlined /> {t("start")}
            </Link>
          </Button>
        )}
      </Card>
    </>
  );
}
