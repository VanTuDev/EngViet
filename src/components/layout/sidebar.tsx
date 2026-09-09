"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tooltip } from "antd";
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@/components/icons";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { SidebarCollapsedContext } from "@/components/layout/sidebar-context";
import { NAV_GROUPS } from "@/lib/constants";
import { useAuth } from "@/components/auth/auth-provider";
import type { Role } from "@/lib/types";
import { siteConfig } from "@/lib/site";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { toggleSidebarCollapsed } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  className,
  onNavigate,
  ctaSlot,
  collapsed = false,
  collapsible = false,
}: {
  role: Role;
  className?: string;
  onNavigate?: () => void;
  ctaSlot?: React.ReactNode;
  /** Chỉ hiện icon, ẩn chữ (dùng cho thanh bên desktop khi người dùng thu gọn). */
  collapsed?: boolean;
  /** Hiện nút thu gọn/mở rộng ở đầu thanh bên (chỉ bản desktop, không phải ngăn kéo mobile). */
  collapsible?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, logout } = useAuth();
  const t = useTranslations("nav");
  const tGroups = useTranslations("nav.groups");
  const tShell = useTranslations("dashboardShell");
  const tRoles = useTranslations("roles");
  const groups = NAV_GROUPS[role];

  async function handleLogout() {
    onNavigate?.();
    if (status === "authenticated") await logout();
    router.push("/login");
  }

  return (
    <aside
      data-collapsed={collapsed ? "" : undefined}
      className={cn(
        "flex h-full flex-col gap-2 border-r border-outline-variant/60 bg-surface-container-low p-3 transition-[width] duration-200 ease-out",
        collapsed ? "w-20 items-center" : "w-64",
        className,
      )}
    >
      {/* Đầu thanh: logo + (tên | nút thu gọn) */}
      <div className={cn("mb-3 flex items-center gap-2.5", collapsed ? "w-full flex-col" : "px-1")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-headline-sm font-bold text-on-primary shadow-sm">
          T
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-headline-sm font-bold leading-tight text-on-surface">
              {siteConfig.name}
            </p>
            <p className="truncate font-label-sm text-label-sm text-on-surface-variant">
              {tShell("portal", { role: tRoles(role) })}
            </p>
          </div>
        ) : null}
        {collapsible ? (
          <Tooltip title={collapsed ? t("expandSidebar") : t("collapseSidebar")} placement="right">
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
              aria-pressed={collapsed}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface md:flex"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </Tooltip>
        ) : null}
      </div>

      <WorkspaceSwitcher mode={role} onNavigate={onNavigate} collapsed={collapsed} />

      <nav
        aria-label={tShell("primaryNav")}
        className={cn("flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden", collapsed && "w-full items-center")}
      >
        {groups.map((group, gi) => (
          <div key={group.labelKey} className={cn("flex flex-col gap-1", collapsed && "w-full items-center")}>
            {collapsed ? (
              gi > 0 ? <div className="my-1 h-px w-8 bg-outline-variant/60" aria-hidden="true" /> : null
            ) : (
              <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
                {tGroups(group.labelKey)}
              </p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              const label = t(item.labelKey);
              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-xl font-label-md text-label-md transition-colors duration-150",
                    collapsed ? "h-11 w-11 justify-center" : "gap-3 px-3 py-2",
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-on-surface-variant hover:bg-surface-variant/70 hover:text-on-surface",
                  )}
                >
                  {active && !collapsed ? (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                  <Icon className="shrink-0 text-xl" aria-hidden="true" />
                  {!collapsed ? <span className="truncate">{label}</span> : null}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={item.href} title={label} placement="right">
                  {link}
                </Tooltip>
              ) : (
                <React.Fragment key={item.href}>{link}</React.Fragment>
              );
            })}
          </div>
        ))}
      </nav>

      {ctaSlot ? (
        <SidebarCollapsedContext.Provider value={collapsed}>
          <div className={cn(collapsed && "flex w-full justify-center")}>{ctaSlot}</div>
        </SidebarCollapsedContext.Provider>
      ) : null}

      <div
        className={cn(
          "mt-1 border-t border-outline-variant/50 pt-2",
          collapsed && "flex w-full justify-center",
        )}
      >
        {collapsed ? (
          <Tooltip title={t("logout")} placement="right">
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t("logout")}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
            >
              <LogoutOutlined aria-hidden="true" />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-on-surface-variant transition-colors duration-150 hover:bg-surface-variant/70 hover:text-on-surface"
          >
            <LogoutOutlined className="shrink-0 text-xl" aria-hidden="true" />
            <span className="font-label-md text-label-md">{t("logout")}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
