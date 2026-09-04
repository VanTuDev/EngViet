import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm",
  {
    variants: {
      variant: {
        neutral: "bg-surface-variant text-on-surface-variant",
        primary: "bg-primary-container/15 text-primary",
        success: "bg-secondary-container text-on-secondary-container border border-secondary-container/50",
        error: "bg-error text-on-error",
        "error-soft": "bg-error-container/60 text-on-error-container",
        warning: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
        outline: "border border-outline-variant text-on-surface-variant",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
