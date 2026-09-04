"use client";

import { useTranslations } from "next-intl";
import { CheckSquareOutlined, ThunderboltOutlined, TrophyOutlined } from "@/components/icons";
import { TiltCard } from "@/components/motion/tilt-card";

const ROW_KEYS = ["tech", "reading", "education"] as const;
const ROW_TONES = [
  "bg-error-container/40 text-on-error-container",
  "bg-primary-container/15 text-primary",
  "bg-secondary-container/30 text-on-secondary-container",
];

/**
 * Minh hoạ 2.5D cho khu hero — thay thẻ mock phẳng cũ. Dựng bằng div + SVG +
 * CSS-3D: bảng bài tập ở lớp sau, thẻ câu hỏi trắc nghiệm nổi ở giữa (lệch trục
 * Z), chip bảng xếp hạng và huy hiệu XP bay hai bên. Cả khối nghiêng theo con
 * trỏ nhờ <TiltCard>; các phần tử nổi `animate-float` lệch pha.
 */
export function HeroScene() {
  const t = useTranslations("marketing.home.hero.card");
  const ta = useTranslations("marketing.home.hero.art");

  return (
    <TiltCard intensity="low" className="mx-auto w-full max-w-md" glare={false}>
      <div role="img" aria-label={ta("label")} className="card-3d relative aspect-[4/5] w-full">
        {/* Đường nối chấm phía sau */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 125" fill="none" aria-hidden="true">
          <path
            d="M22 30 C 40 14, 70 16, 82 34 M78 92 C 60 108, 34 106, 20 88"
            stroke="currentColor"
            className="text-primary/25"
            strokeWidth="1.2"
            strokeDasharray="1 4"
            strokeLinecap="round"
          />
        </svg>

        {/* Lớp sau — bảng bài tập */}
        <div
          className="absolute left-0 top-[8%] w-[86%] rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-elevated"
          style={{ transform: "translateZ(0px)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="font-heading text-headline-sm text-on-surface">{t("className")}</p>
            <span className="rounded-full bg-secondary-container px-2.5 py-1 font-label-sm text-[11px] text-on-secondary-container">
              {t("status")}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {ROW_KEYS.map((k, i) => (
              <div key={k} className={`flex items-center justify-between rounded-lg p-2.5 ${ROW_TONES[i]}`}>
                <span className="truncate font-label-sm text-[12px]">{t(`rows.${k}.label`)}</span>
                <span className="ml-2 shrink-0 font-label-sm text-[10px] opacity-80">{t(`rows.${k}.meta`)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lớp giữa — thẻ câu hỏi trắc nghiệm nổi ra trước */}
        <div
          className="animate-float absolute bottom-[6%] right-0 w-[70%] rounded-2xl border border-primary/15 bg-surface-container-lowest p-4 shadow-float"
          style={{ transform: "translateZ(48px)" }}
        >
          <div className="mb-3 flex items-center gap-2 text-primary">
            <CheckSquareOutlined />
            <span className="font-label-sm text-[11px] text-on-surface-variant">{ta("quizPrompt")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border-2 border-primary bg-primary-container/10 p-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-heading text-[12px] font-bold text-on-primary">
              B
            </span>
            <span className="font-body-sm text-[12px] text-on-surface">{ta("quizOption")}</span>
          </div>
        </div>

        {/* Chip bảng xếp hạng */}
        <div
          className="animate-float-slow absolute right-[2%] top-0 flex items-center gap-2 rounded-full border border-tertiary-fixed-dim bg-surface-container-lowest px-3 py-1.5 shadow-float"
          style={{ transform: "translateZ(64px)", animationDelay: "-2s" }}
        >
          <TrophyOutlined className="text-tertiary" />
          <span className="font-label-sm text-[11px] text-on-surface">{ta("rank")}</span>
        </div>

        {/* Huy hiệu XP */}
        <div
          className="animate-float absolute bottom-[30%] left-[-4%] flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-on-secondary shadow-float"
          style={{ transform: "translateZ(72px)", animationDelay: "-4s" }}
        >
          <ThunderboltOutlined />
          <span className="font-heading text-[13px] font-bold">{ta("xp")}</span>
        </div>
      </div>
    </TiltCard>
  );
}
