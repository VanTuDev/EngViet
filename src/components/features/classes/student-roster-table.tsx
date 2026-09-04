"use client";

import { useTranslations } from "next-intl";
import { LoadingOutlined, TeamOutlined } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useListFilter } from "@/hooks/use-list-filter";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { formatNumber } from "@/lib/utils";
import type { StudentProfile } from "@/lib/types";

/** Danh sách học sinh của lớp: tìm kiếm (debounce) + cuộn vô hạn. */
export function StudentRosterTable({ students }: { students: StudentProfile[] }) {
  const t = useTranslations("dash.roster");
  const tc = useTranslations("dash.common");
  const { query, setQuery, filtered } = useListFilter(students, (s) => `${s.fullName} ${s.email}`);
  const { visible, sentinelRef, hasMore } = useInfiniteScroll(filtered, { pageSize: 12 });

  if (students.length === 0) {
    return <EmptyState icon={TeamOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={query} onChange={setQuery} placeholder={tc("searchStudents")} />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-sm text-on-surface-variant">{tc("noResults")}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{t("colStudent")}</TableHeaderCell>
                  <TableHeaderCell>{t("colEmail")}</TableHeaderCell>
                  <TableHeaderCell className="text-right">{t("colXp")}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={student.fullName} size="sm" />
                        <span className="font-label-md text-label-md text-on-surface">{student.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">{student.email}</TableCell>
                    <TableCell className="text-right font-label-md text-label-md text-primary">
                      {formatNumber(student.xp)} XP
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {hasMore ? (
            <div ref={sentinelRef} className="flex justify-center py-3 text-on-surface-variant" aria-hidden="true">
              <LoadingOutlined spin className="text-lg" />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
