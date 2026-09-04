import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AntdProvider } from "@/components/antd-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { requireRole } from "@/lib/api/guard";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("student", locale);
  return (
    <AuthProvider initialUser={user}>
      <AntdProvider locale={locale as AppLocale}>
        <DashboardShell role="student" userName={user.fullName} notificationCount={1}>
          {children}
        </DashboardShell>
      </AntdProvider>
    </AuthProvider>
  );
}
