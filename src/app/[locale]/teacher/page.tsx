import { redirect } from "@/i18n/navigation";

export default async function TeacherRootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/teacher/dashboard", locale });
}
