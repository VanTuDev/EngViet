"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { slugify } from "@/lib/utils";

/**
 * Lọc + (tuỳ chọn) sắp xếp một danh sách phía client theo từ khoá tìm kiếm.
 * Khớp KHÔNG DẤU (dùng `slugify`) nên gõ "mai" khớp "Mai", "gt" khớp "Giao tiếp".
 * Từ khoá được debounce (~200ms) để không lọc lại trên từng ký tự.
 */
export function useListFilter<T>(
  items: readonly T[],
  getSearchText: (item: T) => string,
  options?: { sort?: (a: T, b: T) => number; debounceMs?: number },
) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, options?.debounceMs ?? 200);

  const filtered = useMemo(() => {
    const needle = slugify(debounced.trim());
    let out = needle
      ? items.filter((item) => slugify(getSearchText(item)).includes(needle))
      : [...items];
    if (options?.sort) out = out.sort(options.sort);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getSearchText/sort là hàm ổn định do người gọi cung cấp
  }, [items, debounced]);

  return { query, setQuery, filtered, isFiltering: debounced.trim().length > 0 };
}
