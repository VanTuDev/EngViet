import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

/**
 * Cấu hình next-intl cho mỗi request phía server.
 *
 * next-intl gọi hàm này ở mọi lần render server để biết:
 * - `locale`: ngôn ngữ nào đang áp dụng (lấy từ segment `[locale]` do middleware khớp).
 * - `messages`: từ điển dịch tương ứng, nạp động từ `messages/{locale}.json`.
 *
 * Nếu segment không hợp lệ (vd bot gọi `/xxx.txt`), ta lùi về `defaultLocale`
 * để tránh render lỗi.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Cố định múi giờ để định dạng ngày/giờ nhất quán giữa server và client
    // (tránh cảnh báo hydration của next-intl). TOPTI phục vụ thị trường Việt Nam.
    timeZone: "Asia/Ho_Chi_Minh",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
