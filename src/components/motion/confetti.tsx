"use client";

import { useEffect, useState } from "react";
import { mulberry32 } from "@/lib/seeded";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const COLORS = ["#004ac6", "#2563eb", "#006c49", "#6cf8bb", "#ad0033", "#ffb2b7", "#b4c5ff"];

/**
 * Hiệu ứng pháo giấy ăn mừng ở màn kết quả — hạt SVG tất định (seed cố định),
 * tự dọn sau ~1.8s, KHÔNG chặn tương tác (`pointer-events-none`). Bỏ hoàn toàn
 * khi bật "giảm chuyển động".
 */
export function Confetti({ count = 70, seedKey = "topti-confetti" }: { count?: number; seedKey?: string }) {
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), 1900);
    return () => window.clearTimeout(id);
  }, []);

  if (reduced || done) return null;

  const rng = mulberry32(seedKey.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7));
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = rng() * 100;
    const delay = rng() * 250;
    const duration = 1100 + rng() * 700;
    const size = 6 + rng() * 7;
    const rotate = rng() * 360;
    const drift = (rng() - 0.5) * 120;
    return { i, left, delay, duration, size, rotate, drift, color: COLORS[Math.floor(rng() * COLORS.length)] };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.i}
          className="confetti-piece absolute top-[-5%] block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            borderRadius: 1,
            // biến CSS cho keyframe confetti-fall
            ["--cf-x" as string]: `${p.drift}px`,
            ["--cf-r" as string]: `${p.rotate + 360}deg`,
            animation: `confetti-fall ${p.duration}ms cubic-bezier(0.2, 0.6, 0.3, 1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
