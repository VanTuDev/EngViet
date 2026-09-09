// Pure date/grouping helpers for the exam schedule ("lịch thi") feature — no JSX here so both
// the teacher and student schedule pages (identical windowing/grouping logic, different card
// links) can share it without duplicating the date math.

import type { Assignment } from "@/lib/types";

/** Every schedule view is exactly 2 calendar weeks — the feature's hard cap ("tối đa 2 tuần"), enforced again server-side (see `AssignmentsService`). */
export const SCHEDULE_WINDOW_DAYS = 14;
/** How far back/forward `?offset=` may jump, in whole 2-week blocks — a sanity bound, not a real product limit. */
const MAX_ABS_OFFSET = 52;

export interface ScheduleDayMeta {
  /** Stable local-day key, e.g. "2026-09-05" — used both as the grouping key and the React key. */
  dateKey: string;
  date: Date;
  isToday: boolean;
}

function dateKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Monday of the calendar week containing `date` (Vietnam convention: week starts Monday). */
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

/** Clamps a `?offset=` query param to a small integer — never trust it to build a `Date` unbounded. */
export function parseWeekOffset(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "0", 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(-MAX_ABS_OFFSET, Math.min(MAX_ABS_OFFSET, parsed));
}

export interface ScheduleRange {
  /** UTC-instant bounds suitable for the backend's `?from=&to=` query. */
  from: Date;
  to: Date;
  days: ScheduleDayMeta[];
  weekOffset: number;
}

/**
 * Default (`weekOffset: 0`) is "tuần chứa ngày này và tuần sau" — the calendar week `today`
 * falls in, plus the following week, Monday-aligned (so with today on a Wednesday this
 * still includes Mon/Tue of the current week, not just today onward). `weekOffset` pages by
 * whole 2-week blocks so every view — default or navigated — stays capped at exactly 14 days.
 */
export function buildScheduleRange(weekOffset = 0): ScheduleRange {
  const from = startOfWeek(new Date());
  from.setDate(from.getDate() + weekOffset * SCHEDULE_WINDOW_DAYS);

  const days: ScheduleDayMeta[] = Array.from({ length: SCHEDULE_WINDOW_DAYS }, (_, i) => {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    return { dateKey: dateKeyOf(date), date, isToday: dateKeyOf(date) === dateKeyOf(new Date()) };
  });

  const to = new Date(from);
  to.setDate(to.getDate() + SCHEDULE_WINDOW_DAYS); // exclusive upper bound

  return { from, to, days, weekOffset };
}

/** Buckets assignments by the local calendar day of their `deadline` — "1 ngày có thể có nhiều bài quiz". */
export function groupAssignmentsByDay(assignments: Assignment[]): Map<string, Assignment[]> {
  const byDay = new Map<string, Assignment[]>();
  for (const assignment of assignments) {
    const key = dateKeyOf(new Date(assignment.deadline));
    const bucket = byDay.get(key);
    if (bucket) bucket.push(assignment);
    else byDay.set(key, [assignment]);
  }
  for (const bucket of byDay.values()) {
    bucket.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }
  return byDay;
}
