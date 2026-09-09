import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FileTextOutlined, PlusOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterableList } from "@/components/ui/filterable-list";
import { AssignmentCard } from "@/components/features/assignments/assignment-card";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";
import { getAssignments } from "@/lib/api/assignments";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.teacher.assignments");
  return buildPrivateMetadata(t("meta"));
}

export default async function TeacherAssignmentsPage() {
  const t = await getTranslations("dash.teacher.assignments");
  const tc = await getTranslations("dash.common");
  const [classes, assignments] = await Promise.all([getMyClasses("owned"), getAssignments(undefined, "owned")]);
  const classNameById = new Map(classes.map((c) => [c.id, c.name]));

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("desc")}
        actions={
          <Button asChild>
            <Link href="/teacher/assignments/new">
              <PlusOutlined /> {t("newButton")}
            </Link>
          </Button>
        }
      />

      <Card className="p-6">
        {assignments.length === 0 ? (
          <EmptyState icon={FileTextOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />
        ) : (
          <FilterableList
            placeholder={tc("searchAssignments")}
            emptyLabel={tc("noResults")}
            className="flex flex-col gap-3"
            entries={assignments.map((assignment) => {
              const classLabel = classNameById.get(assignment.classId) ?? "";
              return {
                id: assignment.id,
                searchText: `${assignment.title} ${classLabel}`,
                node: (
                  <AssignmentCard
                    assignment={assignment}
                    classLabel={classLabel}
                    href={`/teacher/assignments/${assignment.id}`}
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
