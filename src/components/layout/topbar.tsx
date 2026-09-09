"use client";

import { useTranslations } from "next-intl";
import { MenuOutlined } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/features/notifications/notification-bell";
import { siteConfig } from "@/lib/site";
import type { AppNotification, Role } from "@/lib/types";

export function TopBar({
  title,
  subtitle,
  userName,
  avatarUrl,
  role,
  initialNotifications,
  showCommand = false,
  onMenuClick,
}: {
  title: string;
  subtitle?: string;
  userName: string;
  avatarUrl?: string;
  role: Role;
  initialNotifications: AppNotification[];
  showCommand?: boolean;
  onMenuClick: () => void;
}) {
  const t = useTranslations("dashboardShell");
  const tCmd = useTranslations("commandPalette");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant/40 bg-surface px-margin-mobile shadow-sm md:px-gutter">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-2xl text-on-surface hover:bg-surface-variant md:hidden"
        aria-label={t("openMenu")}
      >
        <MenuOutlined />
      </button>
      <span className="font-heading text-headline-md font-bold text-primary md:hidden">{siteConfig.name}</span>

      <div className="hidden md:block">
        <h1 className="font-heading text-headline-lg text-on-surface">{title}</h1>
        {subtitle ? <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {showCommand ? (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("topti-open-command"))}
            aria-label={tCmd("open")}
            title={tCmd("open")}
            className="hidden items-center gap-1.5 rounded-lg border border-outline-variant/70 px-2.5 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-variant lg:flex"
          >
            <span>⌘K</span>
          </button>
        ) : null}
        <ThemeToggle />
        <LanguageSwitcher variant="compact" className="hidden sm:inline-flex" />
        <NotificationBell role={role} initial={initialNotifications} />
        <Avatar name={userName} src={avatarUrl} />
      </div>
    </header>
  );
}
