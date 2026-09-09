/**
 * Trigger a client-side file download of in-memory text (CSV export, a deck
 * template…). Browser-only — guard for SSR. Uses a Blob URL + a synthetic
 * `<a download>` click, revoked on the next tick.
 */
export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8"): void {
  if (typeof window === "undefined") return;
  // Prepend a BOM so Excel opens UTF-8 CSV without mojibaking Vietnamese.
  const blob = new Blob(["﻿", content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
