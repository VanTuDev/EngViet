"use client";

import { cn } from "@/lib/utils";

/**
 * Đồng hồ đếm ngược dạng vòng tròn (SVG). Vòng cung rút dần theo thời gian còn
 * lại; đổi sang màu lỗi khi sắp hết giờ và đập nhẹ (motion-safe).
 */
export function TimerRing({
  secondsLeft,
  totalSeconds,
  label,
  size = 56,
}: {
  secondsLeft: number;
  totalSeconds: number;
  /** Chữ hiển thị giữa vòng (thường là mm:ss). */
  label: string;
  size?: number;
}) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const ratio = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const low = secondsLeft <= 30 && secondsLeft > 0;

  return (
    <div
      className={cn("relative shrink-0", low && "motion-safe:animate-pulse")}
      style={{ width: size, height: size }}
      role="timer"
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} className="stroke-outline-variant/50" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-linear", low ? "stroke-error" : "stroke-primary")}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ratio)}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-heading text-[13px] font-bold tabular-nums",
          low ? "text-error" : "text-on-surface",
        )}
      >
        {label}
      </span>
    </div>
  );
}
