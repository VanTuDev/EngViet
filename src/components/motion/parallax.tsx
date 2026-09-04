"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Dịch nhẹ nội dung theo tiến độ cuộn để tạo cảm giác chiều sâu.
 * `speed` > 0: đi chậm hơn trang (chìm về sau); < 0: nhanh hơn (nổi lên trước).
 * Throttle bằng `requestAnimationFrame`. Tắt hoàn toàn khi "giảm chuyển động".
 */
export function Parallax({
  children,
  speed = 0.15,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Khi bật "giảm chuyển động": không gắn listener, giữ offset = 0.
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      setOffset((elementCenter - viewportCenter) * -speed);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced, speed]);

  const y = reduced ? 0 : offset;
  return (
    <div ref={ref} className={cn("will-change-transform", className)} style={{ transform: `translate3d(0, ${y.toFixed(1)}px, 0)` }}>
      {children}
    </div>
  );
}
