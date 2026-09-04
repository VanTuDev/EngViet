"use client";

import { useState } from "react";
import { cn, formatCurrencyVND } from "@/lib/utils";

export interface BarChartDatum {
  label: string;
  value: number;
}

/**
 * Biểu đồ cột không phụ thuộc thư viện (không recharts/d3) — vài `<div>` là đủ
 * cho dashboard ở đây và giữ cho widget đủ nhẹ để lazy-load qua `next/dynamic`.
 *
 * `format` là một chuỗi enum (không phải hàm) để component này có thể nhận prop
 * từ Server Component mà không vi phạm quy tắc "không truyền hàm cho Client
 * Component" của React Server Components.
 */
export function BarChart({
  data,
  format = "number",
  tone = "primary",
}: {
  data: BarChartDatum[];
  format?: "number" | "currency";
  tone?: "primary" | "secondary";
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const formatValue = (v: number) => (format === "currency" ? formatCurrencyVND(v) : String(v));
  const max = Math.max(...data.map((d) => d.value), 1);
  const barColor = tone === "secondary" ? "bg-secondary" : "bg-primary";

  return (
    <div className="flex h-full w-full items-end justify-between gap-3 rounded-lg bg-surface-variant/30 px-4 pb-4 pt-8">
      {data.map((point, index) => {
        const heightPct = Math.max((point.value / max) * 100, 4);
        const isPeak = point.value === max;
        return (
          <div
            key={point.label}
            className="group relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={cn(
                "absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-inverse-surface px-2 py-1 text-[11px] text-inverse-on-surface transition-opacity",
                hovered === index ? "opacity-100" : "opacity-0",
              )}
              role="tooltip"
            >
              {point.label}: {formatValue(point.value)}
            </div>
            <div
              className={cn(
                "w-full rounded-t-md transition-all duration-300",
                barColor,
                isPeak ? "shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "opacity-70 hover:opacity-100",
              )}
              style={{ height: `${heightPct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
