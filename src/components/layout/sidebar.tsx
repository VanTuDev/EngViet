"use client";

import { useTranslations } from "next-intl";
import { LogoutOutlined } from "@/components/icons";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth/auth-provider";
import type { Role } from "@/lib/types";
import { siteConfig } from "@/lib/site";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  className,
  onNavigate,
  ctaSlot,
}: {
  role: Role;
  className?: string;
  onNavigate?: () => void;
  ctaSlot?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, logout } = useAuth();
  const t = useTranslations("nav");
  const tShell = useTranslations("dashboardShell");
  const tRoles = useTranslations("roles");
  const items = NAV_ITEMS[role];
  const secondaryItems = SECONDARY_NAV_ITEMS[role];

  async function handleLogout() {
    onNavigate?.();
    if (status === "authenticated") await logout();
    router.push("/login");
  }

  return (
    <aside className={cn("flex h-full w-64 flex-col gap-2 border-r border-outline-variant bg-surface-container-low p-4", className)}>
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container font-heading text-headline-sm font-bold text-on-primary-container">
          T
        </div>
        <div>
          <p className="font-heading text-headline-sm font-bold leading-tight text-primary">{siteConfig.name}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {tShell("portal", { role: tRoles(role) })}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label={tShell("primaryNav")}>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all duration-150",
                active
                  ? "bg-primary-container font-bold text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-variant",
              )}
            >
              <Icon className="shrink-0 text-xl" aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {ctaSlot}

      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/50 pt-4">
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant transition-all duration-150 hover:bg-surface-variant"
            >
              <Icon className="shrink-0 text-xl" aria-hidden="true" />
              <span className="font-label-md text-label-md">{t(item.labelKey)}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-on-surface-variant transition-all duration-150 hover:bg-surface-variant"
        >
          <LogoutOutlined className="shrink-0 text-xl" aria-hidden="true" />
          <span className="font-label-md text-label-md">{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
