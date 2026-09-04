import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-between gap-4 sm:flex-row sm:items-center", className)}>
      <div>
        <h2 className="font-heading text-headline-md text-on-surface">{title}</h2>
        {description ? <p className="mt-1 text-body-sm text-on-surface-variant">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
