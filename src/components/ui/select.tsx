import * as React from "react";
import { DownOutlined } from "@/components/icons";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative inline-block">
      <select
        ref={ref}
        className={cn(
          "h-10 appearance-none rounded-lg border border-outline-variant bg-surface py-1 pl-3 pr-9 font-body-sm text-body-sm text-on-surface outline-none transition-colors",
          "focus:border-primary focus:ring-3 focus:ring-primary/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <DownOutlined className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant" />
    </div>
  ),
);
Select.displayName = "Select";
