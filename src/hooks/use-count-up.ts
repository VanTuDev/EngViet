"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Đếm số từ 0 lên `target` bằng `requestAnimationFrame` (ease-out) khi `active`.
 * Bật "giảm chuyển động" → thời lượng ~0 nên nhảy tới `target` gần như tức thì.
 */
export function useCountUp(
  target: number,
  { active = true, durationMs = 900 }: { active?: boolean; durationMs?: number } = {},
) {
  const [value, setValue] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 1 : durationMs;

    let raf = 0;
    startRef.current = 0;
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min(1, (now - startRef.current) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);

  return value;
}
