import { cn, hashToIndex, initials } from "@/lib/utils";

const PALETTE = [
  "bg-primary-container/20 text-primary",
  "bg-secondary-container/40 text-on-secondary-container",
  "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  "bg-surface-container-high text-on-surface-variant",
];

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  /** Ảnh đại diện (vd từ Google) — nếu có thì hiện ảnh, không thì hiện chữ cái đầu. */
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-label-sm" : size === "lg" ? "h-14 w-14 text-headline-sm" : "h-10 w-10 text-label-md";
  const tone = PALETTE[hashToIndex(name, PALETTE.length)];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar nhỏ từ CDN Google, không cần tối ưu next/image
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-full object-cover", sizeClass, className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-heading font-semibold",
        sizeClass,
        tone,
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
