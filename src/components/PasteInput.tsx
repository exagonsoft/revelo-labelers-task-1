"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseText } from "@/lib/parse";
import type { ParseResult } from "@/lib/parse";

interface Props {
  onParsed: (result: ParseResult) => void;
}

export default function PasteInput({ onParsed }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    const result = parseText(value);
    if (!result || result.rows.length === 0) {
      setError("Paste at least two lines of data (header + rows).");
      return;
    }
    setError(null);
    onParsed(result);
  }, [value, onParsed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" && (e.ctrlKey || e.metaKey)) || e.key === "Tab") {
      if (e.key === "Tab") e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <label className="block text-sm font-medium text-muted-light mb-2">
        Paste your data here
        <span className="text-muted ml-2">(CSV, TSV, or any delimited text)</span>
      </label>

      <div
        className={`relative rounded-xl border transition-all duration-200 ${
          focused
            ? "border-brand shadow-[0_0_0_3px_rgba(99,102,241,0.25)]"
            : "border-surface-border"
        }`}
      >
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={`Name\tAge\tCity
Alice\t30\tNew York
Bob\t25\tSan Francisco`}
          spellCheck={false}
          className="w-full h-44 resize-none bg-surface-elevated text-gray-200 placeholder-muted rounded-xl p-4 text-sm font-mono leading-relaxed outline-none"
        />

        {/* bottom bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-surface-border bg-surface-elevated/60 rounded-b-xl">
          <span className="text-xs text-muted">
            {value.split(/\r?\n/).filter(Boolean).length} lines
          </span>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark active:scale-95 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-150 shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sort it
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="mt-2 text-sm text-red-400"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mt-3 text-xs text-muted text-center">
        Tip: <kbd className="px-1.5 py-0.5 bg-surface-elevated rounded border border-surface-border text-muted-light text-[11px]">Ctrl</kbd>{" "}
        <kbd className="px-1 py-0.5 bg-surface-elevated rounded border border-surface-border text-muted-light text-[11px]">+</kbd>{" "}
        <kbd className="px-1.5 py-0.5 bg-surface-elevated rounded border border-surface-border text-muted-light text-[11px]">↵</kbd>{" "}
        to submit
      </p>
    </motion.div>
  );
}
