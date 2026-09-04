"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CommandPalette, type PaletteEntity } from "@/components/features/command-palette/command-palette";
import { useAuth } from "@/components/auth/auth-provider";
import { getSectionTitle } from "@/lib/page-titles";
import { usePathname } from "@/i18n/navigation";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DashboardShellProps {
  role: Role;
  userName: string;
  notificationCount?: number;
  ctaSlot?: React.ReactNode;
  /** Mục động cho bảng lệnh ⌘K (lớp / giáo viên). Chỉ teacher & admin. */
  commandEntities?: PaletteEntity[];
  children: React.ReactNode;
}

/**
 * Khung chrome cố định cho khu vực đã đăng nhập (admin/teacher/student).
 * `children` là "outlet" của route: Next.js thay nội dung theo từng trang con
 * còn khung này (sidebar, thanh trên, nav mobile) vẫn giữ nguyên khi chuyển trang.
 *
 * Mobile: dùng `100dvh` (tránh lỗi thanh URL iOS), nav dưới có safe-area.
 */
export function DashboardShell({
  role,
  userName,
  notificationCount = 0,
  ctaSlot,
  commandEntities,
  children,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations("pageTitles");
  const tShell = useTranslations("dashboardShell");

  // Đăng nhập thật (Google) -> hiện tên/avatar user thật; nếu không -> tên demo.
  const displayName = user?.fullName ?? userName;

  const { titleKey, subtitleKey } = getSectionTitle(role, pathname);
  const title = t(titleKey);
  const subtitle = subtitleKey ? t(subtitleKey) : undefined;

  // Đóng ngăn kéo mobile mỗi khi đổi route. Chỉnh state ngay trong lúc render
  // (thay vì trong effect) để tránh một lần commit thừa mà ngăn kéo còn mở đè
  // lên trang mới.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileNavOpen(false);
  }

  const isStudent = role === "student";

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-surface">
      <Sidebar role={role} ctaSlot={ctaSlot} className="fixed left-0 top-0 z-40 hidden h-[100dvh] md:flex" />

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label={tShell("closeMenu")}
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-on-surface/40 motion-safe:animate-fade-in"
          />
          <div className="relative z-10 h-full w-72 max-w-[85vw] motion-safe:animate-fade-in">
            <Sidebar role={role} ctaSlot={ctaSlot} onNavigate={() => setMobileNavOpen(false)} className="h-full" />
          </div>
        </div>
      ) : null}

      <div className="flex h-[100dvh] min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden md:ml-64">
        <TopBar
          title={title}
          subtitle={subtitle}
          userName={displayName}
          avatarUrl={user?.avatarUrl}
          notificationCount={notificationCount}
          showCommand={role !== "student"}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        {/* Đọc tiêu đề section cho screen reader khi đổi route. */}
        <p aria-live="polite" className="sr-only">
          {title}
        </p>

        <main
          id="main"
          tabIndex={-1}
          className={cn("flex-1 outline-none", isStudent && "pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)] md:pb-0")}
        >
          {/* `key={pathname}` để mỗi route có state riêng (vd tab trong trang lớp
              không dính sang lớp khác). KHÔNG dùng `animate-fade-in` ở đây: fade
              0→1 trong 300ms mỗi lần đổi tab khiến thao tác "cảm giác" chậm dù
              thực tế đã nhanh — đổi tab giờ hiện ngay. Trang nào tải server lâu
              thì `loading.tsx` lo phần khung chờ. */}
          <div
            key={pathname}
            className="mx-auto flex w-full min-w-0 max-w-container flex-col gap-gutter px-margin-mobile py-6 md:px-margin-desktop md:py-8"
          >
            {children}
          </div>
        </main>

        {isStudent ? <MobileBottomNav role={role} /> : null}
      </div>

      {role !== "student" ? <CommandPalette role={role} entities={commandEntities ?? []} /> : null}
    </div>
  );
}
