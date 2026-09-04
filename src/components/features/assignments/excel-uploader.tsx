"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { WarningOutlined, CheckCircleOutlined, FileExcelOutlined, LoadingOutlined, CloudUploadOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseCsv } from "@/lib/csv";
import { cn, slugify } from "@/lib/utils";
import type { VocabularyItem } from "@/lib/types";

interface ParsedRow {
  rowIndex: number;
  item: VocabularyItem | null;
  error: string | null;
}

type Translate = ReturnType<typeof useTranslations>;

function pickField(row: Record<string, string>, keys: string[]): string {
  for (const key of Object.keys(row)) {
    if (keys.includes(key.trim().toLowerCase())) {
      return (row[key] ?? "").trim();
    }
  }
  return "";
}

function parseRows(rows: Record<string, string>[], t: Translate): ParsedRow[] {
  const seenWords = new Set<string>();

  return rows.map((row, index) => {
    const word = pickField(row, ["word", "từ vựng", "tu vung"]);
    const ipa = pickField(row, ["ipa", "phiên âm", "phien am"]);
    const meaning = pickField(row, ["meaning", "nghĩa", "nghia"]);
    const example = pickField(row, ["example", "ví dụ", "vi du"]);

    if (!word || !meaning) {
      return { rowIndex: index + 2, item: null, error: t("missingColumns") };
    }
    const key = word.toLowerCase();
    if (seenWords.has(key)) {
      return { rowIndex: index + 2, item: null, error: t("duplicateWord", { word }) };
    }
    seenWords.add(key);

    return {
      rowIndex: index + 2,
      item: { id: `v-${slugify(word)}`, word, ipa: ipa || "—", meaning, example: example || "" },
      error: null,
    };
  });
}

function downloadSampleCsv() {
  const header = "Word,IPA,Meaning,Example\n";
  const rows = [
    'innovation,/ˌɪnəˈveɪʃn/,sự đổi mới,"Innovation drives economic growth."',
    'reliable,/rɪˈlaɪəbl/,đáng tin cậy,"A reliable connection is essential."',
  ].join("\n");
  const BOM = String.fromCharCode(0xfeff); // giữ dấu tiếng Việt khi mở file trong Excel
  const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "topti-mau-tu-vung.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * UC05 — đọc file CSV từ vựng của giáo viên (các cột Word / IPA / Meaning /
 * Example, xuất từ Excel hoặc Google Sheets) hoàn toàn phía client. Sau đó hệ
 * thống tự sinh minigame ghép từ và trắc nghiệm ABCD từ các dòng này
 * (xem `lib/generators.ts`), nên giáo viên chỉ cần soạn từ vựng thuần, không
 * bao giờ phải tự viết đáp án nhiễu.
 */
export function ExcelUploader({ onParsed }: { onParsed: (vocabulary: VocabularyItem[]) => void }) {
  const t = useTranslations("dash.uploader");
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "done" | "failed">("idle");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setStatus("parsing");
    setFileName(file.name);
    try {
      const text = await file.text();
      const raw = parseCsv(text);
      const parsed = parseRows(raw, t);
      setRows(parsed);
      setStatus("done");
      onParsed(parsed.flatMap((r) => (r.item ? [r.item] : [])));
    } catch {
      setStatus("failed");
      setRows([]);
    }
  }

  const validCount = rows.filter((r) => r.item).length;
  const errorCount = rows.length - validCount;

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary-container/10" : "border-outline-variant bg-surface",
        )}
      >
        {status === "parsing" ? (
          <LoadingOutlined spin className="text-3xl text-primary" />
        ) : (
          <CloudUploadOutlined className="text-3xl text-primary" />
        )}
        <div>
          <p className="font-label-md text-label-md text-on-surface">{t("dropHere")}</p>
          <p className="text-body-sm text-on-surface-variant">{t("hint")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            <FileExcelOutlined /> {t("chooseFile")}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={downloadSampleCsv}>
            {t("downloadSample")}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      {fileName && status !== "parsing" ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-container-low p-3">
          <FileExcelOutlined className="text-base text-on-surface-variant" />
          <span className="font-body-sm text-body-sm text-on-surface">{fileName}</span>
          {status === "done" ? (
            <>
              <Badge variant="success" className="gap-1">
                <CheckCircleOutlined /> {t("validCount", { count: validCount })}
              </Badge>
              {errorCount > 0 ? (
                <Badge variant="error-soft" className="gap-1">
                  <WarningOutlined /> {t("errorRows", { count: errorCount })}
                </Badge>
              ) : null}
            </>
          ) : null}
          {status === "failed" ? (
            <Badge variant="error-soft" className="gap-1">
              <WarningOutlined /> {t("readFailed")}
            </Badge>
          ) : null}
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-outline-variant/50 scrollbar-thin">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-surface-container-low">
              <tr>
                <th className="px-3 py-2 font-label-sm text-label-sm text-on-surface-variant">{t("colRow")}</th>
                <th className="px-3 py-2 font-label-sm text-label-sm text-on-surface-variant">Word</th>
                <th className="px-3 py-2 font-label-sm text-label-sm text-on-surface-variant">Meaning</th>
                <th className="px-3 py-2 font-label-sm text-label-sm text-on-surface-variant">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {rows.map((row) => (
                <tr key={row.rowIndex} className={row.error ? "bg-error-container/20" : undefined}>
                  <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">{row.rowIndex}</td>
                  <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface">{row.item?.word ?? "—"}</td>
                  <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface">{row.item?.meaning ?? "—"}</td>
                  <td className="px-3 py-2 font-body-sm text-body-sm">
                    {row.error ? <span className="text-error">{row.error}</span> : <span className="text-secondary">{t("rowValid")}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
