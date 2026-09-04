import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRightOutlined, PlusCircleOutlined, FieldTimeOutlined, TrophyOutlined } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { JoinClassForm } from "@/components/features/classes/join-class-form";
import { ClassCard } from "@/components/features/classes/class-card";
import { DeadlineItem } from "@/components/features/assignments/deadline-item";
import { EmptyState } from "@/components/ui/empty-state";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";
import { getAssignments } from "@/lib/api/assignments";
import { getCurrentUser } from "@/lib/api/session";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.student");
  return buildPrivateMetadata(t("metaDashboard"));
}

export default async function StudentDashboardPage() {
  const t = await getTranslations("dash.student");
  const tc = await getTranslations("dash.common");
  const [myClasses, assignments, user] = await Promise.all([getMyClasses(), getAssignments(), getCurrentUser()]);
  const classNameById = new Map(myClasses.map((c) => [c.id, c.name]));
  const upcoming = [...assignments].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 3);
  const fullName = user?.fullName ?? "";
  const firstName = fullName.split(" ").pop() || fullName;

  return (
    <>
      <div className="relative min-h-[160px] overflow-hidden rounded-xl bg-surface-container-high p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {t("greeting", { name: firstName })}
          </h2>
          <p className="mt-2 text-body-md text-on-surface-variant">{t("greetingSub")}</p>
        </div>
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 w-1/3 opacity-20"
          style={{ background: "linear-gradient(135deg, transparent, #004ac6)", borderRadius: "50% 0 0 50%", transform: "translateX(30%)" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20 text-xl text-primary">
                <PlusCircleOutlined />
              </div>
              <h3 className="font-heading text-headline-md text-on-surface">{t("joinNewClass")}</h3>
            </div>
            <p className="text-body-md text-on-surface-variant">{t("joinNewClassDesc")}</p>
            <JoinClassForm />
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-heading text-headline-md text-on-surface">{t("myClasses")}</h3>
              <Link href="/student/classes" className="flex items-center gap-1 font-label-md text-label-md text-primary hover:underline">
                {tc("viewAll")} <ArrowRightOutlined />
              </Link>
            </div>
            {myClasses.length === 0 ? (
              <EmptyState icon={PlusCircleOutlined} title={t("noClassesTitle")} description={t("noClassesHint")} />
            ) : (
              <div className="flex flex-col gap-4">
                {myClasses.map((classRoom) => (
                  <ClassCard key={classRoom.id} classRoom={classRoom} href={`/student/classes/${classRoom.id}`} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="h-full p-6">
            <div className="mb-6 flex items-center gap-2 text-error">
              <FieldTimeOutlined className="text-xl" />
              <h3 className="font-heading text-headline-md text-on-surface">{t("upcomingDeadlines")}</h3>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState icon={TrophyOutlined} title={t("noAssignmentsTitle")} description={t("noAssignmentsDone")} />
            ) : (
              <div className="flex flex-col gap-4">
                {upcoming.map((assignment) => (
                  <DeadlineItem
                    key={assignment.id}
                    href={`/student/assignments/${assignment.id}`}
                    title={assignment.title}
                    classLabel={classNameById.get(assignment.classId) ?? ""}
                    detail={
                      assignment.mode === "quiz"
                        ? tc("quizQuestions", { count: assignment.questions.length })
                        : tc("matchingWords", { count: assignment.vocabulary.length })
                    }
                    deadline={assignment.deadline}
                  />
                ))}
              </div>
            )}
            <Link
              href="/student/assignments"
              className="mt-6 block w-full rounded-lg border border-outline-variant py-2 text-center font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-variant/50"
            >
              {t("viewAllAssignments")}
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
