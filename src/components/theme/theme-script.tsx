"use client";

import { THEME_INIT_SCRIPT } from "@/lib/theme";

/**
 * Nhúng script đặt class `.dark` TRƯỚC khi trình duyệt paint để không nháy sáng.
 *
 * Là Client Component có chủ đích: nhờ vậy nhánh `typeof window` mới chạy được
 * ở phía client (Server Component sẽ luôn ra `text/javascript`).
 *
 * `type` khác nhau giữa server và client (theo hướng dẫn chính thức của Next 16 —
 * xem node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md):
 *
 * - SSR (`typeof window === "undefined"`): `text/javascript` → trình duyệt chạy
 *   ngay khi parse HTML, trước cả khi React tải xong.
 * - Client: `text/plain` → React renderer coi là "data block" nên KHÔNG log
 *   "Encountered a script tag while rendering React component" kể cả khi cây bị
 *   dựng lại phía client (Strict Mode remount, hoặc hydration lỗi do tiện ích
 *   trình duyệt). Script cũng không chạy lại — không cần thiết.
 *
 * `suppressHydrationWarning` (ở đây và trên <html> trong layout) bỏ qua chênh
 * lệch thuộc tính `type` và class `.dark` khi hydrate.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
