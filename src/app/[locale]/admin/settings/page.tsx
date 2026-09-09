import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSettingsForm } from "@/components/features/settings/profile-settings-form";
import { buildPrivateMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/api/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.admin.settings");
  return buildPrivateMetadata(t("meta"));
}

export default async function AdminSettingsPage() {
  const t = await getTranslations("dash.admin.settings");
  const tRoles = await getTranslations("roles");
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <ProfileSettingsForm user={user} roleLabel={tRoles("admin")} />
    </>
  );
}
