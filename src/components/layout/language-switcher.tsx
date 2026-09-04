"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Segmented } from "antd";
import { GlobalOutlined } from "@/components/icons";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Bộ chuyển ngôn ngữ VI / EN.
 *
 * Đổi ngôn ngữ = điều hướng sang chính đường dẫn hiện tại nhưng với tiền tố
 * ngôn ngữ khác (`usePathname` của next-intl trả về path đã bỏ tiền tố).
 * next-intl tự lưu lựa chọn vào cookie `NEXT_LOCALE` nên lần sau vào lại giữ nguyên.
 *
 * `variant`:
 * - `"segmented"`: nút gạt VI/EN, dùng ở header marketing và thanh trên dashboard.
 * - `"compact"`: chỉ hiện mã ngôn ngữ, dùng cho không gian hẹp.
 */
export function LanguageSwitcher({
  variant = "segmented",
  className,
}: {
  variant?: "segmented" | "compact";
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLocale(next: string) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  const options = routing.locales.map((code) => ({
    label: (
      <span className="inline-flex items-center gap-1.5 px-0.5">
        {variant === "segmented" && code === locale ? <GlobalOutlined aria-hidden="true" /> : null}
        {code.toUpperCase()}
      </span>
    ),
    value: code,
  }));

  return (
    <Segmented
      size={variant === "compact" ? "small" : "middle"}
      value={locale}
      onChange={(value) => changeLocale(String(value))}
      options={options}
      disabled={isPending}
      className={cn("bg-surface-container", className)}
      aria-label="Language / Ngôn ngữ"
    />
  );
}
