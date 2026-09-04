"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idPrefix: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(component + " must be used inside a <Tabs> component.");
  return ctx;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * A small, dependency-free tab primitive used for in-page "outlet" style
 * content switching (e.g. Quiz mode vs. Matching-game mode on the assignment
 * builder) where a full route change isn't warranted. For switches that
 * *should* be their own URL (dashboard sections, class detail tabs), prefer
 * Next.js nested routes/layouts instead — see the per-role layout.tsx files
 * under app/teacher, app/student and app/admin.
 */
export function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const idPrefix = React.useId();
  const active = value ?? internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      setInternalValue(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value: active, setValue, idPrefix }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-surface-container p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = useTabsContext("TabsTrigger");
  const active = ctx.value === value;
  const tabId = `${ctx.idPrefix}-tab-${value}`;
  const panelId = `${ctx.idPrefix}-panel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "rounded-md px-4 py-2 font-label-md text-label-md transition-colors",
        active ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = useTabsContext("TabsContent");
  if (ctx.value !== value) return null;
  const panelId = `${ctx.idPrefix}-panel-${value}`;
  const tabId = `${ctx.idPrefix}-tab-${value}`;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={cn("animate-fade-in", className)}
      {...props}
    >
      {children}
    </div>
  );
}
