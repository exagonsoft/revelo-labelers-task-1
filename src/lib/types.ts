/** Every row in the table is a flat string-keyed record. */
export type Row = Record<string, string>;

/** A single active sort rule applied to the table. */
export interface SortRule {
  /** The column key being sorted. */
  column: string;
  /** "asc" | "desc" */
  direction: "asc" | "desc";
  /** How the column values should be compared. */
  type: SortType;
}

/** Supported comparison strategies. */
export type SortType = "alpha" | "numeric" | "date" | "length";

/** The full dataset that the app passes around. */
export interface SortDataset {
  /** Column headers derived from the first row (or CSV). */
  columns: string[];
  /** All rows. */
  rows: Row[];
  /** Currently active sort rules (multi-sort). */
  sortRules: SortRule[];
  /** Human-readable title / label set by the user. */
  label?: string;
  /** Timestamp when the dataset was created / last saved. */
  createdAt: number;
}

/** What we persist to localStorage for history. */
export interface HistoryEntry {
  id: string;
  label: string;
  columns: string[];
  rows: Row[];
  sortRules: SortRule[];
  createdAt: number;
}
