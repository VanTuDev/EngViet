import { cn } from "@/lib/utils";
import type { IconType } from "@/lib/constants";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant py-16 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-variant text-2xl text-on-surface-variant">
        <Icon />
      </div>
      <p className="font-heading text-headline-sm text-on-surface">{title}</p>
      {description ? <p className="max-w-sm text-body-sm text-on-surface-variant">{description}</p> : null}
      {action}
    </div>
  );
}
