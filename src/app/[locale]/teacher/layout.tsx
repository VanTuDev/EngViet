import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CreateClassDialog } from "@/components/features/classes/create-class-dialog";
import { AntdProvider } from "@/components/antd-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { getMyClasses } from "@/lib/api/classes";
import { requireRole } from "@/lib/api/guard";
import type { AppLocale } from "@/i18n/routing";

// Khu vực đã đăng nhập, cá nhân hoá — không cache tĩnh.
export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("teacher", locale);
  const classes = await getMyClasses();
  const commandEntities = classes.map((c) => ({
    kind: "class" as const,
    label: c.name,
    href: `/teacher/classes/${c.id}`,
  }));

  return (
    <AuthProvider initialUser={user}>
      <AntdProvider locale={locale as AppLocale}>
        <DashboardShell
          role="teacher"
          userName={user.fullName}
          notificationCount={2}
          ctaSlot={<CreateClassDialog />}
          commandEntities={commandEntities}
        >
          {children}
        </DashboardShell>
      </AntdProvider>
    </AuthProvider>
  );
}
