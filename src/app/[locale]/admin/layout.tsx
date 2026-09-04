import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AntdProvider } from "@/components/antd-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { getTeacherOverviews } from "@/lib/api/admin";
import { requireRole } from "@/lib/api/guard";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("admin", locale);
  const teachers = await getTeacherOverviews();
  const commandEntities = teachers.map((tc) => ({
    kind: "teacher" as const,
    label: tc.fullName,
    href: `/admin/teachers/${tc.id}`,
  }));
  return (
    <AuthProvider initialUser={user}>
      <AntdProvider locale={locale as AppLocale}>
        <DashboardShell role="admin" userName={user.fullName} notificationCount={1} commandEntities={commandEntities}>
          {children}
        </DashboardShell>
      </AntdProvider>
    </AuthProvider>
  );
}
