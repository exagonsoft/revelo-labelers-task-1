"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadHistory, deleteFromHistory, clearHistory } from "@/lib/storage";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function HistoryDrawer({ open, onClose, onRestore }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setEntries(loadHistory());
  }, [open]);

  const remove = (id: string) => {
    deleteFromHistory(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const clear = () => {
    clearHistory();
    setEntries([]);
  };

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-surface-elevated border-l border-surface-border shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <h2 className="text-base font-bold text-white">History</h2>
              <button
                onClick={onClose}
                className="text-muted hover:text-white transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
              <AnimatePresence>
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="group flex items-start gap-3 p-3 rounded-lg hover:bg-surface/60 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      onRestore(entry);
                      onClose();
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {entry.label || "Untitled"}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {entry.columns.length} col · {entry.rows.length} rows · {fmt(entry.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(entry.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all text-lg leading-none"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {entries.length === 0 && (
                <p className="text-center text-muted text-sm py-10">No saved sorts yet.</p>
              )}
            </div>

            {/* footer */}
            {entries.length > 0 && (
              <div className="px-5 py-3 border-t border-surface-border">
                <button
                  onClick={clear}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Clear all history
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
