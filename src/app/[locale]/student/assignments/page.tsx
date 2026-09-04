import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FileTextOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterableList } from "@/components/ui/filterable-list";
import { AssignmentCard } from "@/components/features/assignments/assignment-card";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";
import { getAssignments } from "@/lib/api/assignments";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.student.assignments");
  return buildPrivateMetadata(t("meta"));
}

export default async function StudentAssignmentsPage() {
  const t = await getTranslations("dash.student.assignments");
  const tc = await getTranslations("dash.common");
  const [myClasses, assignments] = await Promise.all([getMyClasses(), getAssignments()]);
  const classNameById = new Map(myClasses.map((c) => [c.id, c.name]));
  const sorted = [...assignments].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <Card className="p-6">
        {sorted.length === 0 ? (
          <EmptyState icon={FileTextOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />
        ) : (
          <FilterableList
            placeholder={tc("searchAssignments")}
            emptyLabel={tc("noResults")}
            className="flex flex-col gap-3"
            entries={sorted.map((assignment) => {
              const classLabel = classNameById.get(assignment.classId) ?? "";
              return {
                id: assignment.id,
                searchText: `${assignment.title} ${classLabel}`,
                node: (
                  <AssignmentCard
                    assignment={assignment}
                    classLabel={classLabel}
                    href={`/student/assignments/${assignment.id}`}
                  />
                ),
              };
            })}
          />
        )}
      </Card>
    </>
  );
}
