import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

/**
 * Bộ điều hướng "hiểu ngôn ngữ".
 *
 * Dùng `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname` từ file này
 * THAY CHO `next/link` và `next/navigation` cho mọi điều hướng nội bộ — chúng tự
 * gắn tiền tố ngôn ngữ hiện tại (`/vi`, `/en`) vào đường dẫn, và `usePathname`
 * trả về đường dẫn ĐÃ BỎ tiền tố ngôn ngữ (tiện cho việc so khớp menu).
 *
 * Vẫn dùng `next/link` cho link ra ngoài miền (mạng xã hội, email...).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
