import { cn } from "@/lib/utils";

/**
 * 4 minh hoạ vector nhỏ cho mục "4 bước" ở trang chủ (khớp thứ tự với
 * `marketing.home.steps.items`): tạo lớp · nhập từ vựng · học sinh làm bài · xem báo cáo.
 * Thuần SVG, tô bằng token màu thương hiệu.
 */
export function StepIllustration({ index, className }: { index: number; className?: string }) {
  const box = cn("h-16 w-16", className);

  const scenes = [
    // 0 — tạo lớp (khung + dấu cộng)
    <svg key="0" viewBox="0 0 64 64" className={box} fill="none" aria-hidden="true">
      <rect x="10" y="14" width="44" height="34" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="3" />
      <path d="M32 24v14M25 31h14" className="stroke-primary" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="17" cy="21" r="2" className="fill-secondary" />
      <circle cx="24" cy="21" r="2" className="fill-primary/40" />
    </svg>,
    // 1 — nhập từ vựng (danh sách + mũi tên xuống)
    <svg key="1" viewBox="0 0 64 64" className={box} fill="none" aria-hidden="true">
      <rect x="14" y="10" width="36" height="26" rx="4" className="fill-secondary/12 stroke-secondary" strokeWidth="3" />
      <path d="M20 19h24M20 27h16" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 40v10M27 45l5 5 5-5" className="stroke-primary" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    // 2 — học sinh làm bài (thẻ A/B + bấm giờ)
    <svg key="2" viewBox="0 0 64 64" className={box} fill="none" aria-hidden="true">
      <rect x="10" y="16" width="30" height="34" rx="5" className="fill-primary/10 stroke-primary" strokeWidth="3" />
      <path d="M17 27h16M17 35h12M17 43h14" className="stroke-primary/60" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="22" r="11" className="fill-secondary/15 stroke-secondary" strokeWidth="3" />
      <path d="M46 22v-6M46 22l4 3" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
    </svg>,
    // 3 — xem báo cáo (cột + đỉnh sao)
    <svg key="3" viewBox="0 0 64 64" className={box} fill="none" aria-hidden="true">
      <path d="M12 52h40" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      <rect x="16" y="34" width="8" height="16" rx="2" className="fill-primary/35" />
      <rect x="28" y="26" width="8" height="24" rx="2" className="fill-secondary" />
      <rect x="40" y="18" width="8" height="32" rx="2" className="fill-primary/70" />
      <path d="M44 12l1.6 3.3 3.6.5-2.6 2.6.6 3.6L44 20.9 40.8 22.6l.6-3.6L38.8 16.4l3.6-.5L44 12z" className="fill-tertiary" />
    </svg>,
  ];

  return scenes[index % scenes.length];
}
