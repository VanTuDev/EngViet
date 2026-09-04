import { cn } from "@/lib/utils";

/**
 * 6 glyph vector trừu tượng cho các thẻ tính năng ở trang chủ (khớp thứ tự với
 * `marketing.home.features.items`). Thuần SVG, tô bằng `currentColor` + một màu
 * nhấn phụ, không phụ thuộc thư viện icon. Hover: bố cục cha thêm hiệu ứng.
 *
 * 0 tạo lớp & mã lớp · 1 import bảng tính · 2 bấm giờ · 3 chấm tự động ·
 * 4 bảng xếp hạng · 5 báo cáo
 */
export function FeatureGlyph({ index, className }: { index: number; className?: string }) {
  const common = "h-14 w-14 shrink-0";
  const accent = "text-secondary";

  const glyphs = [
    // 0 — thẻ mã lớp
    <svg key="0" viewBox="0 0 48 48" className={cn(common, className)} fill="none" aria-hidden="true">
      <rect x="7" y="12" width="34" height="24" rx="4" className="fill-current opacity-15" />
      <rect x="7" y="12" width="34" height="24" rx="4" className="stroke-current" strokeWidth="2.5" />
      <path d="M14 24h6M14 29h12" className={cn("stroke-current", accent)} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="19" r="3" className={cn("fill-current", accent)} />
    </svg>,
    // 1 — bảng tính -> thẻ
    <svg key="1" viewBox="0 0 48 48" className={cn(common, className)} fill="none" aria-hidden="true">
      <rect x="6" y="8" width="20" height="26" rx="3" className="fill-current opacity-15" />
      <rect x="6" y="8" width="20" height="26" rx="3" className="stroke-current" strokeWidth="2.5" />
      <path d="M6 16h20M13 8v26" className="stroke-current" strokeWidth="2" opacity="0.5" />
      <rect x="24" y="18" width="18" height="22" rx="3" className={cn("fill-current", accent)} opacity="0.9" />
      <path d="M28 26h10M28 31h7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>,
    // 2 — vòng bấm giờ
    <svg key="2" viewBox="0 0 48 48" className={cn(common, className)} fill="none" aria-hidden="true">
      <circle cx="24" cy="26" r="15" className="fill-current opacity-12" />
      <circle cx="24" cy="26" r="15" className="stroke-current" strokeWidth="2.5" />
      <path d="M24 26V16" className={cn("stroke-current", accent)} strokeWidth="3" strokeLinecap="round" />
      <path d="M24 26l7 5" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 6h8" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>,
    // 3 — checkmark bung toả
    <svg key="3" viewBox="0 0 48 48" className={cn(common, className)} fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="14" className={cn("fill-current", accent)} opacity="0.18" />
      <circle cx="24" cy="24" r="14" className="stroke-current" strokeWidth="2.5" />
      <path d="M17 24.5l5 5 9-11" className={cn("stroke-current", accent)} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M39 12l3-3M9 36l-3 3M39 36l3 3M9 12l-3-3" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>,
    // 4 — bục podium
    <svg key="4" viewBox="0 0 48 48" className={cn(common, className)} fill="none" aria-hidden="true">
      <rect x="19" y="14" width="10" height="26" className={cn("fill-current", accent)} />
      <rect x="7" y="24" width="10" height="16" className="fill-current opacity-30" />
      <rect x="31" y="20" width="10" height="20" className="fill-current opacity-55" />
      <path d="M24 6l2.2 4.5 5 .7-3.6 3.5.9 5L24 22l-4.5 2.4.9-5L16.8 16l5-.7L24 6z" className={cn("fill-current", accent)} />
    </svg>,
    // 5 — cụm cột báo cáo
    <svg key="5" viewBox="0 0 48 48" className={cn(common, className)} fill="none" aria-hidden="true">
      <path d="M8 40h32" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="11" y="26" width="6" height="12" rx="1.5" className="fill-current opacity-40" />
      <rect x="21" y="18" width="6" height="20" rx="1.5" className={cn("fill-current", accent)} />
      <rect x="31" y="10" width="6" height="28" rx="1.5" className="fill-current opacity-70" />
      <path d="M9 22l8-6 7 4 9-9" className={cn("stroke-current", accent)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
  ];

  return glyphs[index % glyphs.length];
}
