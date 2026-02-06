"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PasteInput from "@/components/PasteInput";
import SortRuleBar from "@/components/SortRuleBar";
import DataTable from "@/components/DataTable";
import ShareModal from "@/components/ShareModal";
import HistoryDrawer from "@/components/HistoryDrawer";
import { sortRows, detectSortType } from "@/lib/sort";
import { saveToHistory } from "@/lib/storage";
import type { Row, SortRule, SortDataset, HistoryEntry } from "@/lib/types";
import type { ParseResult } from "@/lib/parse";

/* ─── helpers ────────────────────────────────────────────────────────────── */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  /* dataset */
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortRules, setSortRules] = useState<SortRule[]>([]);
  const [label, setLabel] = useState("");
  const [datasetId, setDatasetId] = useState<string | null>(null);

  /* UI toggles */
  const [shareOpen, setShareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const hasData = columns.length > 0;

  /* ── sorted rows (memoised) ───────────────────────────────────────────── */
  const sortedRows = useMemo(
    () => sortRows(rows, sortRules),
    [rows, sortRules]
  );

  /* ── paste handler ────────────────────────────────────────────────────── */
  const handleParsed = useCallback((result: ParseResult) => {
    setColumns(result.columns);
    setRows(result.rows);
    // auto-add first sort rule
    const firstCol = result.columns[0];
    setSortRules([
      { column: firstCol, direction: "asc", type: detectSortType(result.rows, firstCol) },
    ]);
    setLabel("");
    setDatasetId(uid());
  }, []);

  /* ── column-header click → quick sort toggle ─────────────────────────── */
  const handleColumnClick = useCallback(
    (column: string) => {
      setSortRules((prev) => {
        const existing = prev.find((r) => r.column === column);
        if (!existing) {
          // add as secondary sort
          return [
            ...prev,
            { column, direction: "asc", type: detectSortType(rows, column) },
          ];
        }
        if (existing.direction === "asc") {
          // flip to desc
          return prev.map((r) =>
            r.column === column ? { ...r, direction: "desc" } : r
          );
        }
        // remove
        return prev.filter((r) => r.column !== column);
      });
    },
    [rows]
  );

  /* ── save to history whenever rules or label change ──────────────────── */
  const persistDataset = useCallback(() => {
    if (!hasData || !datasetId) return;
    const entry: HistoryEntry = {
      id: datasetId,
      label: label || `Sort — ${new Date().toLocaleDateString()}`,
      columns,
      rows,
      sortRules,
      createdAt: Date.now(),
    };
    saveToHistory(entry);
  }, [hasData, datasetId, label, columns, rows, sortRules]);

  /* ── restore from history ─────────────────────────────────────────────── */
  const handleRestore = useCallback((entry: HistoryEntry) => {
    setColumns(entry.columns);
    setRows(entry.rows);
    setSortRules(entry.sortRules);
    setLabel(entry.label);
    setDatasetId(entry.id);
  }, []);

  /* ── dataset for share modal ──────────────────────────────────────────── */
  const dataset: SortDataset = useMemo(
    () => ({
      columns,
      rows: sortedRows,
      sortRules,
      label: label || undefined,
      createdAt: Date.now(),
    }),
    [columns, sortedRows, sortRules, label]
  );

  /* ─── render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── hero / paste zone ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!hasData ? (
          <motion.section
            key="paste"
            className="min-h-screen flex flex-col items-center justify-center px-5 pt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* headline */}
            <motion.h1
              className="text-5xl font-extrabold text-white text-center leading-tight mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              Paste.{" "}
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                Sort.
              </span>{" "}
              Share.
            </motion.h1>
            <motion.p
              className="text-muted-light text-center max-w-md mb-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Drop in any CSV or tabular data. Sort it instantly with
              multi-column rules. Share a public link — no sign-up required.
            </motion.p>

            <PasteInput onParsed={handleParsed} />

            {/* history button — bottom */}
            <motion.button
              onClick={() => setHistoryOpen(true)}
              className="mt-8 text-xs text-muted hover:text-muted-light transition-colors flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6.5 3.5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View history
            </motion.button>
          </motion.section>
        ) : (
          /* ── editor view ───────────────────────────────────────────── */
          <motion.section
            key="editor"
            className="min-h-screen pt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-6xl mx-auto px-5 py-6">
              {/* top bar: label + actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                {/* editable label */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Label this sort…"
                    className="text-xl font-bold text-white bg-transparent border-none outline-none placeholder-muted w-full truncate"
                  />
                </div>

                {/* action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryOpen(true)}
                    className="text-muted-light hover:text-white transition-colors p-2 rounded-lg hover:bg-surface-elevated"
                    title="History"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 4.5v4.5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button
                    onClick={persistDataset}
                    className="text-muted-light hover:text-white transition-colors p-2 rounded-lg hover:bg-surface-elevated"
                    title="Save to history"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 3h12v12a2 2 0 01-2 2H5a2 2 0 01-2-2V3zM7 3V1h4v2M6 8h6M6 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setShareOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="11" cy="3" r="2" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="3" cy="7" r="2" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M4.7 6.3l4.6-2.6M4.7 7.7l4.6 2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    Share
                  </button>

                  <button
                    onClick={() => {
                      setColumns([]);
                      setRows([]);
                      setSortRules([]);
                      setLabel("");
                      setDatasetId(null);
                    }}
                    className="text-muted-light hover:text-white transition-colors p-2 rounded-lg hover:bg-surface-elevated"
                    title="Start over"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 3L3 15M3 3l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* sort rules */}
              <div className="mb-4 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Sort by
                </span>
                <SortRuleBar
                  columns={columns}
                  rows={rows}
                  rules={sortRules}
                  onUpdate={setSortRules}
                />
              </div>

              {/* stats row */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs text-muted">
                  {columns.length} columns · {rows.length} rows
                </span>
                <span className="text-xs text-muted">
                  {sortRules.length} sort rule{sortRules.length !== 1 ? "s" : ""} active
                </span>
              </div>

              {/* table */}
              <DataTable
                columns={columns}
                rows={sortedRows}
                sortRules={sortRules}
                onColumnClick={handleColumnClick}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── modals ──────────────────────────────────────────────────────── */}
      <ShareModal dataset={dataset} open={shareOpen} onClose={() => setShareOpen(false)} />
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
      />
    </div>
  );
}
