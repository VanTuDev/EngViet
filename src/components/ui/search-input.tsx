"use client";

import { CloseCircleOutlined } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Ô tìm kiếm dùng chung cho các danh sách (lớp, bài tập, giáo viên...).
 * Có icon kính lúp, nút xoá nhanh, `font-size` 16px (chống iOS auto-zoom).
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
        fill="none"
      >
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="M14 14l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-lg border border-outline-variant bg-surface pl-9 pr-9 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-3 focus:ring-primary/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Xoá tìm kiếm"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant hover:text-on-surface"
        >
          <CloseCircleOutlined />
        </button>
      ) : null}
    </div>
  );
}
