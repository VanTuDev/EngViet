import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { CreditCardOutlined, ReadOutlined, BankOutlined, TeamOutlined } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LazyBarChart } from "@/components/features/charts/bar-chart.lazy";
import { buildPrivateMetadata } from "@/lib/seo";
import { getPlatformStats, getRevenueTrend } from "@/lib/api/admin";
import { getAllTransactions } from "@/lib/api/billing";
import { formatCurrencyVND, formatNumber } from "@/lib/utils";
import type { TransactionStatus } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dash.admin.dashboard");
  return buildPrivateMetadata(t("meta"));
}

const STATUS_VARIANT: Record<TransactionStatus, "success" | "warning" | "error-soft" | "neutral"> = {
  paid: "success",
  pending: "warning",
  failed: "error-soft",
  expired: "neutral",
};

export default async function AdminDashboardPage() {
  const t = await getTranslations("dash.admin.dashboard");
  const tStatus = await getTranslations("dash.admin.status");
  const format = await getFormatter();
  const [stats, revenueTrend, allTransactions] = await Promise.all([
    getPlatformStats(),
    getRevenueTrend(),
    getAllTransactions(),
  ]);
  const recentTransactions = allTransactions.slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("monthlyRevenue")}
          value={formatCurrencyVND(stats.monthlyRevenue)}
          icon={CreditCardOutlined}
          trend={{ value: stats.revenueGrowthPct, label: t("revenueVsLastMonth") }}
        />
        <StatCard label={t("teachers")} value={formatNumber(stats.totalTeachers)} icon={ReadOutlined} tone="secondary" />
        <StatCard label={t("students")} value={formatNumber(stats.totalStudents)} icon={TeamOutlined} tone="secondary" />
        <StatCard label={t("classes")} value={formatNumber(stats.totalClasses)} icon={BankOutlined} />
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <Card className="flex h-80 flex-col p-6 lg:col-span-7">
          <h3 className="mb-4 font-heading text-headline-md text-on-surface">{t("revenue6m")}</h3>
          <div className="flex-1">
            <LazyBarChart data={revenueTrend.map((p) => ({ label: p.label, value: p.amount }))} format="currency" tone="secondary" />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-5">
          <h3 className="mb-4 font-heading text-headline-md text-on-surface">{t("recentTransactions")}</h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t("colTeacher")}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t("colAmount")}</TableHeaderCell>
                <TableHeaderCell>{t("colStatus")}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <p className="text-on-surface">{tx.teacherName || "—"}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {format.dateTime(new Date(tx.createdAt), { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrencyVND(tx.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[tx.status]}>{tStatus(tx.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
