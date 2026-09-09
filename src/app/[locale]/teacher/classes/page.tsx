import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReadOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterableList } from "@/components/ui/filterable-list";
import { ClassCard } from "@/components/features/classes/class-card";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.teacher.classes");
  return buildPrivateMetadata(t("meta"));
}

export default async function TeacherClassesPage() {
  const t = await getTranslations("dash.teacher.classes");
  const tc = await getTranslations("dash.common");
  const classes = await getMyClasses("owned");

  return (
    <>
      <PageHeader title={t("count", { count: classes.length })} description={t("hint")} />

      <Card className="p-6">
        {classes.length === 0 ? (
          <EmptyState icon={ReadOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />
        ) : (
          <FilterableList
            placeholder={tc("searchClasses")}
            emptyLabel={tc("noResults")}
            entries={classes.map((classRoom) => ({
              id: classRoom.id,
              searchText: `${classRoom.name} ${classRoom.code}`,
              node: <ClassCard classRoom={classRoom} href={`/teacher/classes/${classRoom.id}`} />,
            }))}
          />
        )}
      </Card>
    </>
  );
}
