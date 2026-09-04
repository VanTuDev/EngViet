import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LazyQuizRunner } from "@/components/features/quiz/quiz-runner.lazy";
import { buildPrivateMetadata } from "@/lib/seo";
import { getPlayableAssignment } from "@/lib/api/assignments";

export async function generateMetadata({ params }: { params: Promise<{ assignmentId: string }> }): Promise<Metadata> {
  const { assignmentId } = await params;
  const assignment = await getPlayableAssignment(assignmentId);
  const t = await getTranslations("dash.quiz");
  return buildPrivateMetadata(assignment ? t("metaPlaying", { title: assignment.title }) : t("metaFallback"));
}

export default async function StudentQuizPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const assignment = await getPlayableAssignment(assignmentId);
  if (!assignment || assignment.mode !== "quiz") notFound();

  return (
    <LazyQuizRunner
      assignmentId={assignment.id}
      assignmentTitle={assignment.title}
      classHref={`/student/classes/${assignment.classId}`}
      leaderboardHref={`/student/classes/${assignment.classId}`}
      questions={assignment.questions}
      durationSeconds={assignment.durationSeconds}
    />
  );
}
