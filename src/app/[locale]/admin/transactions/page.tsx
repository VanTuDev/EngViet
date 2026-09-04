import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountBookOutlined } from "@/components/icons";
import { TransactionsTable } from "@/components/features/billing/transactions-table";
import { buildPrivateMetadata } from "@/lib/seo";
import { getAllTransactions } from "@/lib/api/billing";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { TransactionStatus } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.admin.transactions");
  return buildPrivateMetadata(t("meta"));
}

const FILTER_VALUES = ["all", "paid", "pending", "failed"] as const;

export default async function AdminTransactionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const t = await getTranslations("dash.admin.transactions");
  const tStatus = await getTranslations("dash.admin.status");

  const activeFilter = (status as TransactionStatus | "all" | undefined) ?? "all";
  const transactions = await getAllTransactions();
  const filtered = activeFilter === "all" ? transactions : transactions.filter((tx) => tx.status === activeFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <PageHeader title={t("title")} description={t("desc")} />

      <div className="flex flex-wrap gap-2">
        {FILTER_VALUES.map((value) => (
          <Link
            key={value}
            href={value === "all" ? "/admin/transactions" : `/admin/transactions?status=${value}`}
            className={cn(
              "rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors",
              activeFilter === value
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-variant",
            )}
          >
            {value === "all" ? t("filterAll") : tStatus(value)}
          </Link>
        ))}
      </div>

      <Card className="p-6">
        {sorted.length === 0 ? (
          <EmptyState icon={AccountBookOutlined} title={t("emptyTitle")} description={t("emptyDesc")} />
        ) : (
          <TransactionsTable transactions={sorted} />
        )}
      </Card>
    </>
  );
}
