import type { Row } from "./types";

/**
 * Parse pasted text into columns + rows.
 *
 * Supports:
 *   • TSV (tab-separated – default from spreadsheet copy/paste)
 *   • CSV (comma-separated, respects quoted fields)
 *   • Pipe-separated
 *   • Auto-detect delimiter
 */

/* ─── delimiter detection ────────────────────────────────────────────────── */

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0];
  const counts = {
    "\t": (firstLine.match(/\t/g) || []).length,
    ",": (firstLine.match(/,/g) || []).length,
    "|": (firstLine.match(/\|/g) || []).length,
    ";": (firstLine.match(/;/g) || []).length,
  };
  // pick the delimiter with the most occurrences
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/* ─── CSV-safe split (respects quotes) ───────────────────────────────────── */

function splitCSV(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/* ─── public API ─────────────────────────────────────────────────────────── */

export interface ParseResult {
  columns: string[];
  rows: Row[];
}

/**
 * Parse raw pasted text into a structured dataset.
 * Returns null if the input is too empty to be useful.
 */
export function parseText(raw: string): ParseResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    // single line – treat each word / token as a single-column row
    const tokens = trimmed.split(/[\t,|;\s]+/).filter(Boolean);
    if (tokens.length === 0) return null;
    return {
      columns: ["Value"],
      rows: tokens.map((t) => ({ Value: t })),
    };
  }

  const delimiter = detectDelimiter(trimmed);
  const headers = splitCSV(lines[0], delimiter).map(
    (h, i) => h || `Column ${i + 1}`
  );

  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSV(lines[i], delimiter);
    const row: Row = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return { columns: headers, rows };
}
