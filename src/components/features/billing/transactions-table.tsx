"use client";

import { useFormatter, useTranslations } from "next-intl";
import { LoadingOutlined } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { useListFilter } from "@/hooks/use-list-filter";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { formatCurrencyVND } from "@/lib/utils";
import type { Transaction, TransactionStatus } from "@/lib/types";

const STATUS_VARIANT: Record<TransactionStatus, "success" | "warning" | "error-soft" | "neutral"> = {
  paid: "success",
  pending: "warning",
  failed: "error-soft",
  expired: "neutral",
};

/**
 * Bảng giao dịch admin: tìm kiếm (debounce) + cuộn vô hạn (không phân trang số).
 */
export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const t = useTranslations("dash.admin.transactions");
  const tStatus = useTranslations("dash.admin.status");
  const format = useFormatter();

  const { query, setQuery, filtered } = useListFilter(transactions, (tx) => `${tx.reference} ${tx.teacherName} ${tx.planId}`);
  const { visible, sentinelRef, hasMore } = useInfiniteScroll(filtered, { pageSize: 15 });

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={query} onChange={setQuery} placeholder={t("search")} />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-sm text-on-surface-variant">{t("emptyDesc")}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{t("colReference")}</TableHeaderCell>
                  <TableHeaderCell>{t("colTeacher")}</TableHeaderCell>
                  <TableHeaderCell>{t("colPlan")}</TableHeaderCell>
                  <TableHeaderCell className="text-right">{t("colAmount")}</TableHeaderCell>
                  <TableHeaderCell>{t("colStatus")}</TableHeaderCell>
                  <TableHeaderCell>{t("colTime")}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-label-md text-label-md text-on-surface">{tx.reference}</TableCell>
                    <TableCell>{tx.teacherName}</TableCell>
                    <TableCell className="capitalize">{tx.planId}</TableCell>
                    <TableCell className="text-right">{formatCurrencyVND(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[tx.status]}>{tStatus(tx.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      {format.dateTime(new Date(tx.createdAt), { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
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
