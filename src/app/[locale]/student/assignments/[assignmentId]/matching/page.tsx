import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LazyMatchingBoard } from "@/components/features/matching/matching-board.lazy";
import { buildPrivateMetadata } from "@/lib/seo";
import { getPlayableAssignment } from "@/lib/api/assignments";

export async function generateMetadata({ params }: { params: Promise<{ assignmentId: string }> }): Promise<Metadata> {
  const { assignmentId } = await params;
  const assignment = await getPlayableAssignment(assignmentId);
  const t = await getTranslations("dash.matching");
  return buildPrivateMetadata(assignment ? t("metaPlaying", { title: assignment.title }) : t("metaFallback"));
}

export default async function StudentMatchingPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const assignment = await getPlayableAssignment(assignmentId);
  if (!assignment || assignment.mode !== "matching") notFound();

  return (
    <LazyMatchingBoard
      assignmentId={assignment.id}
      assignmentTitle={assignment.title}
      classHref={`/student/classes/${assignment.classId}`}
      leaderboardHref={`/student/classes/${assignment.classId}`}
      vocabulary={assignment.vocabulary}
      durationSeconds={assignment.durationSeconds}
      pairCount={8}
    />
  );
}
