"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "topti-sidebar-collapsed";
const EVENT = "topti-sidebar-change";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Trạng thái thu gọn của thanh bên desktop (chỉ hiện icon khi thu gọn).
 * Lưu ở localStorage, đồng bộ giữa `DashboardShell` và `Sidebar` qua một sự kiện
 * tuỳ biến — đọc bằng `useSyncExternalStore` để không phải `setState` trong effect
 * (xem quy tắc `react-hooks/set-state-in-effect` trong CLAUDE.md, cùng mẫu với
 * `ThemeToggle` / `useIsDark`). Server luôn trả `false` (mở rộng) để khớp HTML SSR.
 */
export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribe, readCollapsed, () => false);
}

/** Đảo trạng thái thu gọn và phát sự kiện để mọi consumer cập nhật ngay. */
export function toggleSidebarCollapsed() {
  const next = !readCollapsed();
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // localStorage có thể bị chặn (chế độ riêng tư) — bỏ qua, chỉ mất tính ghi nhớ.
  }
  window.dispatchEvent(new Event(EVENT));
}
