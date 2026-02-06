"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Row, SortRule } from "@/lib/types";

interface Props {
  columns: string[];
  rows: Row[];
  sortRules: SortRule[];
  /** When provided, clicking a column header toggles / adds a sort rule. */
  onColumnClick?: (column: string) => void;
  readonly?: boolean;
}

export default function DataTable({
  columns,
  rows,
  sortRules,
  onColumnClick,
  readonly: isReadonly = false,
}: Props) {
  const activeRule = (col: string) => sortRules.find((r) => r.column === col);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-surface-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => {
              const rule = activeRule(col);
              const clickable = !!onColumnClick && !isReadonly;
              return (
                <th
                  key={col}
                  onClick={() => clickable && onColumnClick?.(col)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider bg-surface-elevated text-muted-light whitespace-nowrap select-none ${
                    clickable ? "cursor-pointer hover:text-brand-light transition-colors" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col}</span>
                    {rule && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-4 h-4 rounded bg-brand/20 text-brand-light text-[10px]"
                      >
                        {rule.direction === "asc" ? "↑" : "↓"}
                      </motion.span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="sync">
            {rows.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, backgroundColor: "rgba(99,102,241,0.12)" }}
                animate={{ opacity: 1, backgroundColor: "transparent" }}
                transition={{ duration: 0.35, delay: i * 0.015, ease: [0.16, 1, 0.3, 1] }}
                className={`border-b border-surface-border/60 last:border-0 hover:bg-surface-elevated/50 transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-gray-300 whitespace-nowrap">
                    {row[col] ?? ""}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="text-center text-muted py-10 text-sm">No data to display.</div>
      )}
    </div>
  );
}
