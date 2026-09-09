"use client";

import { useState, type ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Card, Empty } from "antd";
import { cn } from "@/lib/utils";
import type { AssignmentMode } from "@/lib/types";

export interface ScheduleDayItem {
  dateKey: string;
  date: Date;
  isToday: boolean;
  count: number;
  /** Lightweight per-assignment summary for the in-cell chips (the full cards live in `node`). */
  items: { id: string; title: string; mode: AssignmentMode }[];
  /** Pre-rendered server-side (each row is an async `AssignmentCard`) — see the schedule pages for why. */
  node: ReactNode;
}

const MAX_CHIPS_PER_CELL = 3;

/**
 * The exam schedule as an actual month-style calendar: a 7-column (Mon–Sun) grid, two
 * week-rows (the feature's fixed 2-week window). Each day cell shows its date and the
 * quizzes due that day as little chips; clicking a cell opens that day's full quiz list
 * in the panel below. The list nodes are rendered server-side (async `AssignmentCard`),
 * this component only owns which day is selected.
 */
export function ScheduleCalendar({ days }: { days: ScheduleDayItem[] }) {
  const t = useTranslations("dash.schedule");
  const format = useFormatter();

  const firstWithItems = days.find((d) => d.count > 0)?.dateKey;
  const todayKey = days.find((d) => d.isToday)?.dateKey;
  const [selected, setSelected] = useState<string>(firstWithItems ?? todayKey ?? days[0]?.dateKey ?? "");
  // Tolerate a stale selection (e.g. after paging to another 2-week block) without a setState-in-effect.
  const current =
    days.find((d) => d.dateKey === selected) ?? days.find((d) => d.isToday) ?? days[0];

  const weeks = [days.slice(0, 7), days.slice(7, 14)];
  const weekdayHeaders = days.slice(0, 7);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-outline-variant bg-surface p-2 sm:p-3">
        <div className="grid grid-cols-7 gap-1 pb-1 sm:gap-1.5">
          {weekdayHeaders.map((d) => (
            <div
              key={d.dateKey}
              className="text-center font-label-sm text-label-sm uppercase text-on-surface-variant"
            >
              {format.dateTime(d.date, { weekday: "short" })}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 sm:gap-1.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {week.map((day) => {
                const active = current?.dateKey === day.dateKey;
                const shown = day.items.slice(0, MAX_CHIPS_PER_CELL);
                const overflow = day.items.length - shown.length;
                const isMonthStart = day.date.getDate() === 1;

                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => setSelected(day.dateKey)}
                    aria-current={active ? "date" : undefined}
                    aria-label={`${format.dateTime(day.date, { weekday: "long", day: "numeric", month: "long" })} — ${
                      day.count > 0 ? t("dayHasCount", { count: day.count }) : t("emptyDay")
                    }`}
                    className={cn(
                      "flex min-h-[3.25rem] min-w-0 flex-col items-center gap-1 rounded-lg border p-1 transition-colors sm:min-h-[6.75rem] sm:items-stretch sm:p-1.5",
                      active
                        ? "border-primary bg-primary-container/15 ring-1 ring-primary"
                        : day.isToday
                          ? "border-primary/50 bg-primary-container/5 hover:bg-primary-container/15"
                          : "border-outline-variant bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low",
                    )}
                  >
                    <span className="flex items-center gap-1 sm:self-start">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full font-label-md text-label-md tabular-nums",
                          day.isToday ? "bg-primary font-bold text-on-primary" : "text-on-surface",
                        )}
                      >
                        {format.dateTime(day.date, { day: "numeric" })}
                      </span>
                      {isMonthStart ? (
                        <span className="hidden font-label-sm text-[10px] uppercase text-on-surface-variant sm:inline">
                          {format.dateTime(day.date, { month: "short" })}
                        </span>
                      ) : null}
                    </span>

                    {/* sm+ : title chips */}
                    <span className="hidden w-full flex-col gap-0.5 sm:flex">
                      {shown.map((item) => (
                        <span
                          key={item.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[11px] leading-tight",
                            item.mode === "quiz"
                              ? "bg-primary/15 text-primary"
                              : "bg-secondary/15 text-secondary",
                          )}
                        >
                          {item.title}
                        </span>
                      ))}
                      {overflow > 0 ? (
                        <span className="px-1 text-[11px] leading-tight text-on-surface-variant">
                          +{overflow} {t("more")}
                        </span>
                      ) : null}
                    </span>

                    {/* mobile : coloured dots */}
                    {day.count > 0 ? (
                      <span className="mt-auto flex flex-wrap justify-center gap-0.5 sm:hidden">
                        {day.items.slice(0, 4).map((item) => (
                          <span
                            key={item.id}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              item.mode === "quiz" ? "bg-primary" : "bg-secondary",
                            )}
                          />
                        ))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Card
        title={
          current
            ? `${current.isToday ? `${t("today")} · ` : ""}${format.dateTime(current.date, {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}`
            : undefined
        }
      >
        {current && current.count > 0 ? current.node : <Empty description={t("emptyDay")} />}
      </Card>
    </div>
  );
}
