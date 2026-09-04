"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MenuOutlined, CloseOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/lib/site";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/pricing", key: "pricing" },
  { href: "/help", key: "help" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("marketing.nav");

  // Đổ bóng + tăng độ mờ nền khi người dùng cuộn xuống một chút.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        scrolled
          ? "border-outline-variant/60 bg-surface/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-surface/70 backdrop-blur",
      )}
    >
      {/* Vệt gradient mảnh dưới đáy header, hiện dần khi cuộn. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="mx-auto flex h-16 w-full max-w-container items-center justify-between px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-headline-sm font-bold text-on-primary shadow-sm">
            T
          </span>
          <span className="font-heading text-headline-sm font-bold text-primary">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("primaryNav")}>
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 font-label-md text-label-md transition-colors",
                  active ? "text-primary" : "text-on-surface-variant hover:bg-surface-variant hover:text-primary",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <LanguageSwitcher variant="compact" />
          <Button asChild variant="ghost" className="ml-1">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button asChild>
            <Link href="/register">{t("register")}</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-2xl text-on-surface md:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
        >
          {open ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      <div className={cn("border-t border-outline-variant/50 bg-surface md:hidden", open ? "block animate-fade-in" : "hidden")}>
        <nav className="flex flex-col gap-1 px-margin-mobile py-4" aria-label={t("mobileNav")}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant"
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-2 px-3">
            <LanguageSwitcher variant="compact" />
            <ThemeToggle />
          </div>
          <div className="mt-2 flex flex-col gap-2 px-3">
            <Button asChild variant="outline">
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t("register")}</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
