import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSettingsForm } from "@/components/features/settings/profile-settings-form";
import { EmailVerificationCard } from "@/components/features/settings/email-verification-card";
import { LevelProgressCard } from "@/components/features/gamification/level-progress-card";
import { BadgeGrid } from "@/components/features/gamification/badge-grid";
import { BirthdayBanner } from "@/components/features/gamification/birthday-banner";
import { buildPrivateMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/api/session";
import { getGamificationSummary } from "@/lib/api/gamification";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.student.settings");
  return buildPrivateMetadata(t("meta"));
}

export default async function StudentSettingsPage() {
  const t = await getTranslations("dash.student.settings");
  const tRoles = await getTranslations("roles");
  const [user, gamification] = await Promise.all([getCurrentUser(), getGamificationSummary()]);
  if (!user) return null;

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />
      <div className="flex flex-col gap-gutter">
        <EmailVerificationCard emailVerified={user.emailVerified} />
        <BirthdayBanner dateOfBirth={user.dateOfBirth} />
        {gamification ? (
          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
            <LevelProgressCard summary={gamification} />
            <BadgeGrid earned={gamification.badges} />
          </div>
        ) : null}
        <ProfileSettingsForm user={user} roleLabel={tRoles("student")} />
      </div>
    </>
  );
}
