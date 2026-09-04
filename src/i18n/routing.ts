import { defineRouting } from "next-intl/routing";

/**
 * Cấu hình định tuyến đa ngôn ngữ của TOPTI.
 *
 * - `locales`: hai ngôn ngữ hệ thống hỗ trợ — tiếng Việt và tiếng Anh.
 * - `defaultLocale`: tiếng Việt là ngôn ngữ mặc định (thị trường chính).
 * - `localePrefix: "always"`: MỌI URL đều có tiền tố ngôn ngữ (`/vi/...`, `/en/...`).
 *   Truy cập `/` sẽ được middleware chuyển hướng sang `/vi`.
 *
 * Đây là nguồn sự thật duy nhất về danh sách ngôn ngữ — các nơi khác import lại
 * từ đây thay vì tự khai báo mảng `["vi", "en"]`.
 */
export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always",
});

/** Kiểu ngôn ngữ hợp lệ, suy ra từ `routing.locales`. */
export type AppLocale = (typeof routing.locales)[number];
