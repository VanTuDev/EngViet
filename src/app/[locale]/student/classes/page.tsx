import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReadOutlined } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClassCard } from "@/components/features/classes/class-card";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.student.classes");
  return buildPrivateMetadata(t("meta"));
}

export default async function StudentClassesPage() {
  const t = await getTranslations("dash.student.classes");
  const myClasses = await getMyClasses();

  return (
    <>
      <PageHeader title={t("title")} description={t("desc", { count: myClasses.length })} />
      <Card className="p-6">
        {myClasses.length === 0 ? (
          <EmptyState icon={ReadOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />
        ) : (
          <div className="flex flex-col gap-4">
            {myClasses.map((classRoom) => (
              <ClassCard key={classRoom.id} classRoom={classRoom} href={`/student/classes/${classRoom.id}`} />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
