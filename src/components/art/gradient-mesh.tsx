import { mulberry32, stringSeed } from "@/lib/seeded";
import { cn } from "@/lib/utils";

/**
 * Trường "mesh gradient" nhẹ — vài quầng sáng mờ neo gần các góc, trôi rất chậm
 * và lệch pha. Thuần SVG + CSS animation nên render được ở Server Component; vị
 * trí quầng sáng tất định (seed từ `seedKey`) để không vỡ hydration.
 *
 * `variant`:
 * - `"surface"`: dùng trên nền sáng (hero, section).
 * - `"onPrimary"`: dùng trên nền xanh đậm (dải CTA) — quầng sáng trắng/xanh lá.
 */
export function GradientMesh({
  seedKey = "topti-mesh",
  variant = "surface",
  className,
  blobs = 3,
}: {
  seedKey?: string;
  variant?: "surface" | "onPrimary";
  className?: string;
  blobs?: number;
}) {
  const rng = mulberry32(stringSeed(seedKey));
  // Neo mỗi quầng sáng vào một góc rồi lệch nhẹ — tránh dồn vào giữa thành mảng xám.
  const anchors: readonly [number, number][] = [
    [12, 6],
    [88, 14],
    [78, 92],
    [8, 86],
    [50, 50],
  ];
  const field = Array.from({ length: Math.min(blobs, anchors.length) }, (_, i) => {
    const [ax, ay] = anchors[i] ?? [50, 50];
    return {
      cx: ax + (rng() - 0.5) * 14,
      cy: ay + (rng() - 0.5) * 14,
      r: 26 + rng() * 14,
      delay: -rng() * 16,
      dur: 20 + rng() * 12,
    };
  });

  const palette =
    variant === "onPrimary"
      ? ["rgba(255,255,255,0.34)", "rgba(108,248,187,0.3)", "rgba(180,197,255,0.26)"]
      : ["rgba(37,99,235,0.16)", "rgba(0,108,73,0.12)", "rgba(173,0,51,0.08)"];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <svg
        className="h-full w-full scale-125 blur-2xl"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {field.map((_, i) => (
            <radialGradient key={i} id={`${seedKey}-b${i}`}>
              <stop offset="0%" stopColor={palette[i % palette.length]} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          ))}
        </defs>
        {field.map((b, i) => (
          <circle
            key={i}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            fill={`url(#${seedKey}-b${i})`}
            className="motion-safe:animate-blob"
            style={{
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              transformOrigin: `${b.cx}px ${b.cy}px`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
