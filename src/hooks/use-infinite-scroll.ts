"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** Số phần tử hiện thêm mỗi lần chạm đáy. */
  pageSize?: number;
  /** Khoảng cách trước khi tới sentinel thì đã nạp thêm. */
  rootMargin?: string;
}

/**
 * Cuộn vô hạn thay cho phân trang số (1, 2, 3...). Trả về:
 *  - `visible`: lát cắt đầu danh sách để render
 *  - `sentinelRef`: gắn vào một phần tử rỗng ở cuối danh sách; khi nó lọt vào
 *    khung nhìn thì tự hiện thêm `pageSize` phần tử
 *  - `hasMore`: còn phần tử chưa hiện hay không
 *
 * Tự đặt lại về trang đầu khi `items` đổi (vd lọc/tìm kiếm khác đi) — theo mẫu
 * "chỉnh state khi render" của React, không dùng effect.
 */
export function useInfiniteScroll<T>(items: readonly T[], { pageSize = 12, rootMargin = "400px 0px" }: Options = {}) {
  const [count, setCount] = useState(pageSize);
  const [prevItems, setPrevItems] = useState(items);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  if (items !== prevItems) {
    setPrevItems(items);
    setCount(pageSize);
  }

  const hasMore = count < items.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCount((c) => Math.min(items.length, c + pageSize));
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, items.length, pageSize, rootMargin]);

  return {
    visible: items.slice(0, count),
    sentinelRef,
    hasMore,
    remaining: Math.max(0, items.length - count),
  };
}
