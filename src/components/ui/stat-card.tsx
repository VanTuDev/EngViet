import { RiseOutlined, FallOutlined } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IconType } from "@/lib/constants";

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "primary",
  trend,
  footer,
  className,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
  icon: IconType;
  tone?: "primary" | "secondary" | "error";
  trend?: { value: number; label?: string };
  footer?: React.ReactNode;
  className?: string;
}) {
  const toneClasses = {
    primary: "bg-primary-container/10 text-primary",
    secondary: "bg-secondary-container/20 text-secondary",
    error: "bg-error-container/50 text-error",
  }[tone];

  return (
    <Card className={cn("flex flex-col p-6", className)}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="mb-1 font-label-md text-label-md text-on-surface-variant">{label}</h3>
          <p className="font-heading text-headline-xl text-on-surface">
            {value}
            {suffix ? <span className="font-heading text-headline-md text-outline">{suffix}</span> : null}
          </p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl", toneClasses)}>
          <Icon />
        </div>
      </div>
      <div className="mt-auto">
        {trend ? (
          <p
            className={cn(
              "flex items-center gap-1 font-label-sm text-label-sm",
              trend.value >= 0 ? "text-secondary" : "text-error",
            )}
          >
            {trend.value >= 0 ? <RiseOutlined className="text-sm" /> : <FallOutlined className="text-sm" />}
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        ) : null}
        {footer}
      </div>
    </Card>
  );
}
