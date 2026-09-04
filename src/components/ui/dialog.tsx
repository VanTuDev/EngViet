"use client";

import * as React from "react";
import { CloseOutlined } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Built on the native `<dialog>` element: free focus-trapping, Escape-to-close
 * and top-layer stacking from the browser instead of a hand-rolled portal.
 */
export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false);
      }}
      className={cn(
        "w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-0 shadow-elevated backdrop:bg-on-surface/40 backdrop:backdrop-blur-sm",
        className,
      )}
      aria-labelledby="dialog-title"
    >
      <div className="flex items-start justify-between gap-4 p-6 pb-2">
        <div>
          <h2 id="dialog-title" className="font-heading text-headline-md text-on-surface">
            {title}
          </h2>
          {description ? <p className="mt-1 text-body-sm text-on-surface-variant">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Đóng"
          className="rounded-full p-1.5 text-xl text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
        >
          <CloseOutlined />
        </button>
      </div>
      <div className="p-6 pt-2">{children}</div>
    </dialog>
  );
}
