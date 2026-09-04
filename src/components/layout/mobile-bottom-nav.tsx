"use client";

import { useTranslations } from "next-intl";
import { NAV_ITEMS } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Thanh tab dưới cùng cho màn hình nhỏ — soi lại các mục sidebar chính để điều hướng nhất quán giữa các breakpoint. */
export function MobileBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tShell = useTranslations("dashboardShell");
  const items = NAV_ITEMS[role].slice(0, 4);

  return (
    <nav
      aria-label={tShell("quickNav")}
      className="h-bottom-nav fixed bottom-0 left-0 z-40 flex w-full items-stretch justify-between border-t border-outline-variant bg-surface-container-low px-2 md:hidden"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-[3.5rem] flex-1 flex-col items-center justify-center gap-1 py-1 active:scale-95",
              active ? "text-primary" : "text-on-surface-variant",
            )}
          >
            {active ? (
              <span className="rounded-full bg-primary-container px-4 py-1 text-base text-on-primary-container">
                <Icon />
              </span>
            ) : (
              <Icon className="text-xl" />
            )}
            <span className={cn("font-label-sm text-[10px]", active && "font-semibold")}>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
