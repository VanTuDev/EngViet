import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border bg-surface px-4 font-body-md text-body-md text-on-surface outline-none transition-all",
        "placeholder:text-outline focus:border-primary focus:ring-3 focus:ring-primary/20",
        invalid ? "border-error focus:border-error focus:ring-error/20" : "border-outline-variant",
        className,
      )}
      aria-invalid={invalid}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all",
        "placeholder:text-outline focus:border-primary focus:ring-3 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("font-label-md text-label-md text-on-surface", className)} {...props} />;
}
