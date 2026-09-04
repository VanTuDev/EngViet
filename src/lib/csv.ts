/**
 * Minimal, dependency-free CSV parser (RFC 4180: quoted fields, escaped
 * `""`, commas/newlines inside quotes). The npm `xlsx` package has two
 * unpatched high-severity advisories (prototype pollution + ReDoS) with no
 * fix available, so vocabulary import here is CSV-only — Excel/Google
 * Sheets both export CSV directly via "Save As" / "Download".
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows = tokenizeCsv(text.replace(/^﻿/, ""));
  if (rows.length === 0) return [];

  const header = rows[0]!.map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    header.forEach((key, i) => {
      record[key] = row[i] ?? "";
    });
    return record;
  });
}

function tokenizeCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  return rows;
}
