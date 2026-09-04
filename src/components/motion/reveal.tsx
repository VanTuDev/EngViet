"use client";

import { Children, cloneElement, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealStyle = CSSProperties & { "--reveal-y"?: string };

function phaseClass(phase: "idle" | "pending" | "in") {
  return phase === "pending" ? "reveal-pending" : phase === "in" ? "reveal-in" : undefined;
}

interface RevealProps {
  children: ReactNode;
  /** Trễ (ms) trước khi hiện — tạo hiệu ứng nối tiếp. */
  delay?: number;
  /** Độ dịch theo trục Y khi còn ẩn (px). */
  y?: number;
  className?: string;
}

/**
 * Bọc nội dung để nó "trồi lên + hiện dần" khi cuộn tới.
 *
 * Nội dung LUÔN hiển thị mặc định (SSR / không JS / trên màn hình sẵn); chỉ khi
 * JS xác nhận phần tử còn ở dưới màn hình mới tạm ẩn rồi hiện lại lúc cuộn tới.
 */
export function Reveal({ children, delay = 0, y = 16, className }: RevealProps) {
  const { ref, phase } = useInView<HTMLDivElement>();
  const style: RevealStyle = { transitionDelay: `${delay}ms`, "--reveal-y": `${y}px` };

  return (
    <div ref={ref} className={cn("reveal-init", phaseClass(phase), className)} style={style}>
      {children}
    </div>
  );
}

/**
 * Container theo dõi MỘT lần, rồi "nhân bản" từng phần tử con và gắn thêm class
 * reveal + `transition-delay` tăng dần (`stagger` ms). DOM phẳng (không bọc div
 * thừa) nên hợp với grid/flex — đặt luôn class layout của lưới lên `className`.
 */
export function RevealGroup({
  children,
  stagger = 80,
  y = 16,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  y?: number;
  className?: string;
}) {
  const { ref, phase } = useInView<HTMLDivElement>();
  const cls = phaseClass(phase);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    className?: string;
    style?: CSSProperties;
  }>[];

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => {
        const style: RevealStyle = {
          ...(child.props.style ?? {}),
          transitionDelay: `${i * stagger}ms`,
          "--reveal-y": `${y}px`,
        };
        return cloneElement(child, {
          key: child.key ?? i,
          className: cn("reveal-init", cls, child.props.className),
          style,
        });
      })}
    </div>
  );
}
