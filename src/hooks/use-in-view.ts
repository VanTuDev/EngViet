"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  rootMargin?: string;
  amount?: number;
}

export type RevealPhase = "idle" | "pending" | "in";

/**
 * Điều phối hiệu ứng "reveal khi cuộn" một cách AN TOÀN:
 *
 * - Mặc định (SSR + lần render client đầu tiên) trả `phase = "idle"` → CSS để
 *   nội dung HIỂN THỊ ĐẦY ĐỦ. Không bao giờ có "nháy ẩn".
 * - Sau khi mount, ở khung hình kế tiếp (`requestAnimationFrame`) mới kiểm tra:
 *   nếu phần tử ĐÃ ở trong / trên khung nhìn hoặc người dùng bật "giảm chuyển
 *   động" → giữ `"idle"` (hiện luôn). Nếu phần tử còn ở DƯỚI màn hình → chuyển
 *   `"pending"` (CSS ẩn xuống) rồi `IntersectionObserver` đưa lên `"in"` khi cuộn tới.
 *
 * Nhờ vậy trình chụp ảnh tĩnh / bot / tab nền đều thấy nội dung, còn người dùng
 * thật vẫn có hiệu ứng trồi lên khi cuộn.
 */
export function useInView<T extends Element = HTMLDivElement>({
  rootMargin = "0px 0px -10% 0px",
  amount = 0.12,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [phase, setPhase] = useState<RevealPhase>("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let observer: IntersectionObserver | undefined;

    const raf = window.requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rect = node.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight * 0.92;

      if (reduced || alreadyVisible || typeof IntersectionObserver === "undefined") {
        setPhase("idle");
        return;
      }

      setPhase("pending");
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setPhase("in");
            observer?.disconnect();
          }
        },
        { rootMargin, threshold: amount },
      );
      observer.observe(node);
    });

    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [rootMargin, amount]);

  return { ref, phase };
}
