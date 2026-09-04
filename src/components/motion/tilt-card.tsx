"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Biên độ nghiêng tối đa (độ). "low" ~4°, "medium" ~8°. */
  intensity?: "low" | "medium";
  /** Hiện lớp "glare" (ánh sáng loang theo con trỏ). */
  glare?: boolean;
}

/**
 * Thẻ nghiêng 3D theo con trỏ (CSS `perspective` + `rotateX/rotateY`, không dùng
 * thư viện). Trên thiết bị cảm ứng hoặc khi bật "giảm chuyển động" → tắt nghiêng,
 * chỉ còn hiệu ứng nâng nhẹ khi hover.
 */
export function TiltCard({ children, className, intensity = "medium", glare = true }: TiltCardProps) {
  const reduced = usePrefersReducedMotion();
  const innerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("");
  const [glarePos, setGlarePos] = useState<{ x: number; y: number } | null>(null);

  const max = intensity === "low" ? 4 : 8;
  const active = !reduced;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!active || e.pointerType === "touch") return;
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 2 * max;
    const rotX = -(py - 0.5) * 2 * max;
    setTransform(`rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(0)`);
    if (glare) setGlarePos({ x: px * 100, y: py * 100 });
  }

  function reset() {
    setTransform("");
    setGlarePos(null);
  }

  return (
    <div
      className={cn("group/tilt [perspective:1200px]", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      <div
        ref={innerRef}
        className="relative h-full transition-transform duration-200 ease-out-back will-change-transform [transform-style:preserve-3d]"
        style={{ transform: transform || undefined }}
      >
        {children}
        {glare && glarePos ? (
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <span
              className="absolute inset-0 opacity-60 mix-blend-soft-light"
              style={{
                background: `radial-gradient(240px circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.55), transparent 55%)`,
              }}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}
