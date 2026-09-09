import { parseCsv } from "@/lib/csv";
import type { DeckEntry } from "@/lib/types";

/**
 * CSV ⇄ deck entries. Same four columns as the assignment vocabulary uploader
 * (`word,ipa,meaning,example`) so a teacher can move a list between the two.
 * CSV only — see `lib/csv.ts` for why there's no real `.xlsx`.
 */
export const DECK_CSV_HEADER = "word,ipa,meaning,example";

const HEADER_ALIASES: Record<string, keyof DeckEntry> = {
  word: "word",
  "từ": "word",
  "tu": "word",
  term: "word",
  ipa: "ipa",
  "phiên âm": "ipa",
  pronunciation: "ipa",
  meaning: "meaning",
  "nghĩa": "meaning",
  "nghia": "meaning",
  definition: "meaning",
  vi: "meaning",
  example: "example",
  "ví dụ": "example",
  "vi du": "example",
  sentence: "example",
};

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function deckEntriesToCsv(entries: DeckEntry[]): string {
  const lines = [DECK_CSV_HEADER];
  for (const e of entries) {
    lines.push([e.word, e.ipa, e.meaning, e.example].map(csvCell).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

/**
 * Parse an uploaded CSV into deck entries. Tolerant: recognises a few Vietnamese/English
 * header names, and if the first row doesn't look like a header, treats every row as data
 * in `word,ipa,meaning,example` order. Rows without a word or a meaning are dropped.
 */
export function parseDeckCsv(text: string): DeckEntry[] {
  const trimmed = text.replace(/^﻿/, "").trim();
  if (!trimmed) return [];

  const firstLine = trimmed.split(/\r?\n/, 1)[0]?.toLowerCase() ?? "";
  const looksLikeHeader = /word|từ|tu|term|meaning|nghĩa|nghia/.test(firstLine);

  let rows: Record<string, string>[];
  if (looksLikeHeader) {
    const records = parseCsv(trimmed);
    rows = records.map((rec) => {
      const out: Record<string, string> = {};
      for (const [rawKey, val] of Object.entries(rec)) {
        const mapped = HEADER_ALIASES[rawKey.trim().toLowerCase()];
        if (mapped) out[mapped] = val;
      }
      return out;
    });
  } else {
    // headerless — inject a synthetic header and re-parse so quoting still works
    rows = parseCsv(`${DECK_CSV_HEADER}\r\n${trimmed}`);
  }

  const seen = new Set<string>();
  const entries: DeckEntry[] = [];
  for (const row of rows) {
    const word = (row.word ?? "").trim();
    const meaning = (row.meaning ?? "").trim();
    const key = word.toLowerCase();
    if (!word || !meaning || seen.has(key)) continue;
    seen.add(key);
    entries.push({ word, ipa: (row.ipa ?? "").trim(), meaning, example: (row.example ?? "").trim() });
  }
  return entries;
}
