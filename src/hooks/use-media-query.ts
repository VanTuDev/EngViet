"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/** SSR-safe media query hook (defaults to `false` on the server to match Next.js's initial HTML). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * `true` khi người dùng bật "giảm chuyển động" ở hệ điều hành. Mọi hiệu ứng
 * 3D / parallax / drift phải kiểm hook này và tắt bớt khi bằng `true`.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * `true` khi giao diện đang ở chế độ tối (class `.dark` trên `<html>`, do
 * `ThemeToggle` gắn). Theo dõi thay đổi bằng `MutationObserver`.
 */
export function useIsDark(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const obs = new MutationObserver(cb);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => obs.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}
