"use client";

import type { ReactNode } from "react";
import { LoadingOutlined } from "@/components/icons";
import { SearchInput } from "@/components/ui/search-input";
import { useListFilter } from "@/hooks/use-list-filter";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

export interface FilterableListEntry {
  id: string;
  /** Chuỗi dùng để khớp tìm kiếm (thường là tên + email/mã lớp). */
  searchText: string;
  /** Nội dung hiển thị — có thể là Server Component đã render sẵn từ trang. */
  node: ReactNode;
}

/**
 * Bọc một danh sách (Server Component render sẵn từng dòng) + ô tìm kiếm
 * (debounce) + cuộn vô hạn (không phân trang số). Server truyền `entries`.
 */
export function FilterableList({
  entries,
  placeholder,
  emptyLabel,
  pageSize = 10,
  className = "flex flex-col gap-4",
}: {
  entries: FilterableListEntry[];
  placeholder: string;
  emptyLabel: string;
  pageSize?: number;
  className?: string;
}) {
  const { query, setQuery, filtered } = useListFilter(entries, (e) => e.searchText);
  const { visible, sentinelRef, hasMore } = useInfiniteScroll(filtered, { pageSize });

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={query} onChange={setQuery} placeholder={placeholder} />
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-sm text-on-surface-variant">{emptyLabel}</p>
      ) : (
        <>
          <div className={className}>
            {visible.map((e) => (
              <div key={e.id}>{e.node}</div>
            ))}
          </div>
          {hasMore ? (
            <div ref={sentinelRef} className="flex justify-center py-4 text-on-surface-variant" aria-hidden="true">
              <LoadingOutlined spin className="text-lg" />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
