import type { Row, SortRule, SortType } from "./types";

/* ─── individual comparators ─────────────────────────────────────────────── */

function cmpAlpha(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function cmpNumeric(a: string, b: string): number {
  const na = parseFloat(a.replace(/[^0-9.\-+eE]/g, ""));
  const nb = parseFloat(b.replace(/[^0-9.\-+eE]/g, ""));
  if (isNaN(na) && isNaN(nb)) return 0;
  if (isNaN(na)) return 1; // non-numbers sink
  if (isNaN(nb)) return -1;
  return na - nb;
}

function cmpDate(a: string, b: string): number {
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (isNaN(da) && isNaN(db)) return 0;
  if (isNaN(da)) return 1;
  if (isNaN(db)) return -1;
  return da - db;
}

function cmpLength(a: string, b: string): number {
  return a.length - b.length;
}

const comparators: Record<SortType, (a: string, b: string) => number> = {
  alpha: cmpAlpha,
  numeric: cmpNumeric,
  date: cmpDate,
  length: cmpLength,
};

/* ─── public API ─────────────────────────────────────────────────────────── */

/**
 * Apply an ordered list of sort rules to rows and return a new sorted array.
 * Earlier rules have higher priority (stable multi-sort).
 */
export function sortRows(rows: Row[], rules: SortRule[]): Row[] {
  if (rules.length === 0) return [...rows];

  return [...rows].sort((a, b) => {
    for (const rule of rules) {
      const valA = (a[rule.column] ?? "").trim();
      const valB = (b[rule.column] ?? "").trim();
      const cmp = comparators[rule.type](valA, valB);
      if (cmp !== 0) return rule.direction === "asc" ? cmp : -cmp;
    }
    return 0;
  });
}

/**
 * Auto-detect the best SortType for a column by sampling values.
 */
export function detectSortType(rows: Row[], column: string): SortType {
  const samples = rows
    .slice(0, 20)
    .map((r) => (r[column] ?? "").trim())
    .filter(Boolean);

  if (samples.length === 0) return "alpha";

  // date heuristic: most samples parse as valid dates and contain separators
  const dateLike = samples.filter(
    (v) => !isNaN(Date.parse(v)) && /[-/.]/.test(v)
  );
  if (dateLike.length / samples.length > 0.6) return "date";

  // numeric heuristic
  const numLike = samples.filter(
    (v) => !isNaN(parseFloat(v.replace(/[^0-9.\-+eE]/g, "")))
  );
  if (numLike.length / samples.length > 0.7) return "numeric";

  return "alpha";
}
