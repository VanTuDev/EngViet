import { cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
  trackClassName,
  tone = "primary",
}: {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  tone?: "primary" | "success" | "error";
}) {
  const pct = clamp((value / max) * 100, 0, 100);
  const toneClass = tone === "success" ? "bg-secondary" : tone === "error" ? "bg-error" : "bg-primary";

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-variant", trackClassName)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", toneClass, className)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
