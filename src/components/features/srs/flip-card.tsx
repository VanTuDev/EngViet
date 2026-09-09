"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A 3D flip card. Click (or Enter/Space) flips between `front` and `back`.
 * Controlled: the parent owns `flipped` and gets `onFlip(next)` — so the review
 * flow can also flip it from a "Hiện đáp án" button and reset it on Next.
 * The 3D CSS lives in `globals.css` (`.flip-*`), reduced-motion aware.
 */
export function FlipCard({
  front,
  back,
  flipped,
  onFlip,
  className,
  minHeight = "18rem",
  ariaLabel,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped: boolean;
  onFlip: (next: boolean) => void;
  className?: string;
  minHeight?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={ariaLabel}
      onClick={() => onFlip(!flipped)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFlip(!flipped);
        }
      }}
      className={cn("flip-perspective w-full cursor-pointer select-none outline-none", className)}
    >
      <div
        className={cn("flip-inner relative w-full rounded-2xl", flipped && "is-flipped")}
        style={{ minHeight }}
      >
        <div className="flip-face absolute inset-0 flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm focus-visible:ring-2 focus-visible:ring-primary sm:p-8">
          {front}
        </div>
        <div className="flip-face flip-face-back absolute inset-0 flex flex-col rounded-2xl border border-primary/40 bg-primary-container/15 p-6 shadow-sm sm:p-8">
          {back}
        </div>
      </div>
    </div>
  );
}
