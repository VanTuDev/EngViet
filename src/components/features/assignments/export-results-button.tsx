"use client";

import { useTranslations } from "next-intl";
import { DownloadOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

/** UC07 — xuất bảng xếp hạng/kết quả hiện tại ra CSV (mở sạch trong Excel/Sheets). */
export function ExportResultsButton({ results, fileName }: { results: LeaderboardEntry[]; fileName: string }) {
  const t = useTranslations("dash.export");

  function handleExport() {
    const header = `${t("csvHeader")}\n`;
    const rows = results
      .map((r) =>
        [r.rank, r.studentName, r.score, formatDuration(r.timeTakenSeconds)]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const BOM = String.fromCharCode(0xfeff); // giữ dấu tiếng Việt khi mở file trong Excel
    const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="secondary" onClick={handleExport} disabled={results.length === 0}>
      <DownloadOutlined /> {t("button")}
    </Button>
  );
}
