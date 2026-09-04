"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { GlobalOutlined } from "@/components/icons";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ORDER: ThemePreference[] = ["system", "light", "dark"];

function applyTheme(pref: ThemePreference) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#10131c" : "#f8f9ff");
}

// Store ngoài: lựa chọn theme lưu trong localStorage. Đọc bằng useSyncExternalStore
// để không phải setState trong effect.
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("topti-theme-change", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("topti-theme-change", cb);
  };
}
function readPref(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

/**
 * Nút xoay giao diện: system → light → dark. Lưu localStorage, đổi class `.dark`
 * ngay. Script inline trong <head> đã đặt class ban đầu nên không nháy.
 */
export function ThemeToggle({ className, floating }: { className?: string; floating?: boolean }) {
  const t = useTranslations("theme");
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as ThemePreference);

  // Khi đang để "theo hệ thống": OS đổi sáng/tối thì áp lại ngay.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readPref() === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length]!;
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new Event("topti-theme-change"));
  }

  const label = t(pref);
  const icon = pref === "dark" ? <MoonIcon /> : pref === "light" ? <SunIcon /> : <GlobalOutlined />;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary",
        floating && "h-11 w-11 border border-outline-variant/60 bg-surface-container-lowest shadow-card",
        className,
      )}
    >
      {icon}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.05em] w-[1.05em]" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.05em] w-[1.05em]" fill="none" aria-hidden="true">
      <path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
