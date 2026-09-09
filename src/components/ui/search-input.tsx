"use client";

import { CloseCircleOutlined, SearchOutlined } from "@/components/icons";
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
      <SearchOutlined
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-lg border border-outline-variant bg-surface pl-9 pr-10 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-3 focus:ring-primary/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Xoá tìm kiếm"
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
        >
          <CloseCircleOutlined />
        </button>
      ) : null}
    </div>
  );
}
