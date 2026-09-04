"use client";

import { useMemo } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme as antdTheme, type ThemeConfig } from "antd";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import { useIsDark } from "@/hooks/use-media-query";
import type { AppLocale } from "@/i18n/routing";

/**
 * New feature work in this app is built with real `antd` components (see the
 * CLAUDE.md rule). This provider maps our design tokens onto antd's theme and
 * follows light/dark (class `.dark` on `<html>`, xem `ThemeToggle`).
 */
const ANTD_LOCALES = { vi: viVN, en: enUS } as const;

export function AntdProvider({
  children,
  locale = "vi",
}: {
  children: React.ReactNode;
  locale?: AppLocale;
}) {
  const dark = useIsDark();

  // Ổn định tham chiếu object `theme` — nếu tạo mới mỗi lần render, antd cssinjs
  // phải tính lại toàn bộ style. Chỉ đổi khi sáng/tối đổi.
  const theme = useMemo<ThemeConfig>(
    () => ({
      algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: dark ? "#adc6ff" : "#004ac6",
        colorSuccess: dark ? "#4edea3" : "#006c49",
        colorError: dark ? "#ffb4ab" : "#ba1a1a",
        colorWarning: dark ? "#ffb2b7" : "#ad0033",
        colorInfo: dark ? "#adc6ff" : "#004ac6",
        colorTextBase: dark ? "#e2e8f5" : "#0b1c30",
        colorBgBase: dark ? "#10131c" : "#f8f9ff",
        colorBgContainer: dark ? "#1c212c" : "#ffffff",
        colorBorder: dark ? "#3c4250" : "#c3c6d7",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        borderRadius: 8,
        borderRadiusLG: 16,
        fontSize: 14,
      },
      components: {
        Modal: { borderRadiusLG: 16 },
        Button: { borderRadius: 8, controlHeight: 40 },
        Card: { borderRadiusLG: 16 },
      },
    }),
    [dark],
  );

  return (
    <AntdRegistry>
      <ConfigProvider locale={ANTD_LOCALES[locale]} theme={theme}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
