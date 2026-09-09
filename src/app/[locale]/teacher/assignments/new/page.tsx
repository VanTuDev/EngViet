import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { LazyAssignmentBuilderForm } from "@/components/features/assignments/assignment-builder-form.lazy";
import { buildPrivateMetadata } from "@/lib/seo";
import { getMyClasses } from "@/lib/api/classes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.teacher.newAssignmentPage");
  return buildPrivateMetadata(t("meta"));
}

export default async function NewAssignmentPage() {
  const t = await getTranslations("dash.teacher.newAssignmentPage");
  const tNav = await getTranslations("nav");
  const classes = await getMyClasses("owned");

  return (
    <>
      <Breadcrumbs items={[{ label: tNav("teacherAssignments"), href: "/teacher/assignments" }, { label: t("crumb") }]} />
      <PageHeader title={t("title")} description={t("desc")} />
      <LazyAssignmentBuilderForm classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
