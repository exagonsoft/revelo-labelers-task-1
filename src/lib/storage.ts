"use client";

import type { HistoryEntry } from "./types";

const HISTORY_KEY = "sortly:history";
const MAX_HISTORY = 30;

/* ─── helpers ────────────────────────────────────────────────────────────── */

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

/* ─── public API ─────────────────────────────────────────────────────────── */

export function saveToHistory(entry: HistoryEntry): void {
  const list = read().filter((e) => e.id !== entry.id);
  list.unshift(entry);
  write(list.slice(0, MAX_HISTORY));
}

export function loadHistory(): HistoryEntry[] {
  return read();
}

export function deleteFromHistory(id: string): void {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory(): void {
  write([]);
}
