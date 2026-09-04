import { mulberry32, stringSeed } from "@/lib/seeded";

// Chip từ vựng — đặt ở dải TRÊN và dải DƯỚI, tránh vùng giữa nơi có chữ.
const CHIPS: { word: string; left: number; band: "top" | "bottom" }[] = [
  { word: "innovation", left: 18, band: "top" },
  { word: "reliable", left: 62, band: "top" },
  { word: "diverse", left: 40, band: "top" },
  { word: "sustainable", left: 22, band: "bottom" },
  { word: "efficiency", left: 58, band: "bottom" },
  { word: "impact", left: 78, band: "bottom" },
];

/**
 * Nền trang trí cho cột thương hiệu ở trang đăng nhập/đăng ký: cung tròn đồng
 * tâm mờ + "chip từ vựng" trôi nhẹ + quầng sáng. Thuần SVG/CSS (Server Component),
 * mọi tham số tất định.
 */
export function AuthPanelArt() {
  const rng = mulberry32(stringSeed("topti-auth"));
  const chips = CHIPS.map((c) => ({
    ...c,
    top: (c.band === "top" ? 6 : 82) + rng() * 12,
    delay: -rng() * 12,
    dur: 12 + rng() * 8,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Quầng sáng */}
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(22rem 22rem at 8% -5%, rgba(255,255,255,0.4), transparent 62%), radial-gradient(28rem 28rem at 105% 105%, rgba(108,248,187,0.4), transparent 60%)",
        }}
      />

      {/* Cung tròn đồng tâm xoay chậm */}
      <svg className="absolute -right-24 top-1/3 h-[36rem] w-[36rem] motion-safe:animate-spin-slow" viewBox="0 0 200 200" fill="none">
        {[70, 92, 114].map((r, i) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            strokeDasharray={i === 1 ? "2 8" : undefined}
          />
        ))}
      </svg>

      {/* Chip từ vựng trôi */}
      {chips.map((chip) => (
        <span
          key={chip.word}
          className="absolute rounded-full border border-white/20 bg-white/10 px-3 py-1 font-label-sm text-[11px] text-white/70 backdrop-blur motion-safe:animate-float"
          style={{
            left: `${chip.left}%`,
            top: `${chip.top}%`,
            animationDelay: `${chip.delay}s`,
            animationDuration: `${chip.dur}s`,
          }}
        >
          {chip.word}
        </span>
      ))}
    </div>
  );
}
