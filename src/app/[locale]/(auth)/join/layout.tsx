import { AntdProvider } from "@/components/antd-provider";
import type { AppLocale } from "@/i18n/routing";

/**
 * Chỉ luồng "vào lớp" (`/join`, `/join/[code]`) dùng antd (Form, Segmented,
 * Modal, App.message). Bọc `AntdProvider` ở đây để `/login` và `/register`
 * KHÔNG phải tải antd.
 */
export default async function JoinLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AntdProvider locale={locale as AppLocale}>{children}</AntdProvider>;
}
