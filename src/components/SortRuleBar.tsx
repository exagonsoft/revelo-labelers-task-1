"use client";

import { motion, AnimatePresence } from "framer-motion";
import { detectSortType } from "@/lib/sort";
import type { Row, SortRule, SortType } from "@/lib/types";

interface Props {
  columns: string[];
  rows: Row[];
  rules: SortRule[];
  onUpdate: (rules: SortRule[]) => void;
}

const TYPE_LABELS: Record<SortType, string> = {
  alpha: "A→Z",
  numeric: "0→9",
  date: "Date",
  length: "Length",
};

export default function SortRuleBar({ columns, rows, rules, onUpdate }: Props) {
  const addRule = () => {
    // pick first column not already used, or repeat first
    const used = new Set(rules.map((r) => r.column));
    const col = columns.find((c) => !used.has(c)) ?? columns[0];
    onUpdate([
      ...rules,
      { column: col, direction: "asc", type: detectSortType(rows, col) },
    ]);
  };

  const updateRule = (idx: number, patch: Partial<SortRule>) => {
    onUpdate(rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRule = (idx: number) => {
    onUpdate(rules.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence>
        {rules.map((rule, idx) => (
          <motion.div
            key={idx}
            className="flex items-center gap-1.5 bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5"
            initial={{ opacity: 0, scale: 0.88, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* priority badge */}
            {rules.length > 1 && (
              <span className="text-[10px] font-bold text-brand-light bg-brand/15 rounded-full w-4 h-4 flex items-center justify-center">
                {idx + 1}
              </span>
            )}

            {/* column picker */}
            <select
              value={rule.column}
              onChange={(e) => {
                const col = e.target.value;
                updateRule(idx, {
                  column: col,
                  type: detectSortType(rows, col),
                });
              }}
              className="bg-transparent text-gray-200 text-sm font-medium border-none outline-none cursor-pointer max-w-[140px] truncate"
            >
              {columns.map((c) => (
                <option key={c} value={c} className="bg-surface-elevated text-gray-200">
                  {c}
                </option>
              ))}
            </select>

            {/* direction toggle */}
            <button
              onClick={() =>
                updateRule(idx, {
                  direction: rule.direction === "asc" ? "desc" : "asc",
                })
              }
              className="text-brand-light hover:text-white transition-colors text-xs font-semibold bg-brand/10 hover:bg-brand/20 rounded px-1.5 py-0.5"
            >
              {rule.direction === "asc" ? "↑" : "↓"}
            </button>

            {/* type picker */}
            <select
              value={rule.type}
              onChange={(e) =>
                updateRule(idx, { type: e.target.value as SortType })
              }
              className="bg-transparent text-muted-light text-xs border-none outline-none cursor-pointer"
            >
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="bg-surface-elevated text-gray-200">
                  {label}
                </option>
              ))}
            </select>

            {/* remove */}
            <button
              onClick={() => removeRule(idx)}
              className="text-muted hover:text-red-400 transition-colors ml-0.5"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={addRule}
        className="flex items-center gap-1 text-xs text-muted-light hover:text-brand-light transition-colors border border-dashed border-surface-border hover:border-brand/40 rounded-lg px-2.5 py-1.5"
      >
        <span className="text-base leading-none">+</span> Add sort
      </button>
    </div>
  );
}
