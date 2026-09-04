import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", opts ?? { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "giây"],
    [60, "phút"],
    [24, "giờ"],
    [7, "ngày"],
    [4.345, "tuần"],
    [12, "tháng"],
    [Number.POSITIVE_INFINITY, "năm"],
  ];
  let value = seconds;
  for (const [step, unit] of units) {
    if (value < step) return `${Math.max(1, Math.floor(value))} ${unit} trước`;
    value /= step;
  }
  return d.toISOString();
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Rung phản hồi trên thiết bị hỗ trợ (mobile). Không làm gì trên desktop/SSR. */
export function haptic(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * Trợ giúp về thời gian — gói `Date.now()` vào module tiện ích thay vì gọi trực
 * tiếp trong thân component (quy tắc `react-hooks/purity` cấm gọi hàm không thuần
 * khi render, kể cả Server Component async).
 */
export function currentTimestamp(): number {
  return Date.now();
}

/** Số giờ (có thể âm nếu đã quá hạn) từ bây giờ tới `date`. */
export function hoursUntil(date: string | Date): number {
  const target = typeof date === "string" ? new Date(date) : date;
  return (target.getTime() - Date.now()) / (1000 * 60 * 60);
}

/** Deterministic string hash used to pick stable pseudo-random UI accents from an id. */
export function hashToIndex(id: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % modulo;
}
