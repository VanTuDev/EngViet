import * as React from "react";

/**
 * Minimal "asChild" primitive (a lightweight stand-in for Radix's Slot).
 * Lets `<Button asChild><Link href="...">...</Link></Button>` merge the
 * button's classes/props onto the child element instead of wrapping it in
 * an extra DOM node.
 */
export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;

    const child = children as React.ReactElement<{ className?: string }>;

    return React.cloneElement(child, {
      ...props,
      ...child.props,
      className: [className, child.props.className].filter(Boolean).join(" "),
      ref,
    } as Partial<{ className?: string; ref?: React.Ref<HTMLElement> }>);
  },
);
Slot.displayName = "Slot";
