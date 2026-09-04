"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Trả về `value` nhưng bị "trễ" `delayMs` sau lần thay đổi cuối — dùng cho ô
 * tìm kiếm để không lọc/gọi API trên từng ký tự.
 */
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

/**
 * Bọc một hàm sao cho nó chỉ chạy sau khi ngừng gọi `delayMs`. Ref giữ callback
 * mới nhất nên không cần đưa `fn` vào deps ở nơi gọi.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delayMs = 250,
): (...args: A) => void {
  const fnRef = useRef(fn);
  const timerRef = useRef<number | null>(null);

  // Giữ callback mới nhất — không ghi ref trong lúc render.
  useLayoutEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (...args: A) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => fnRef.current(...args), delayMs);
  };
}
