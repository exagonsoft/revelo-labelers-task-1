"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { encodeShare } from "@/lib/share";
import type { SortDataset } from "@/lib/types";

interface Props {
  dataset: SortDataset;
  open: boolean;
  onClose: () => void;
}

export default function ShareModal({ dataset, open, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    try {
      const token = await encodeShare({
        columns: dataset.columns,
        rows: dataset.rows,
        sortRules: dataset.sortRules,
        label: dataset.label,
      });
      setUrl(`${window.location.origin}/s/${token}`);
    } catch {
      setUrl(null);
    }
  }, [dataset]);

  useEffect(() => {
    if (open) generate();
  }, [open, generate]);

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-md bg-surface-elevated border border-surface-border rounded-2xl p-6 shadow-2xl"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Share this sort</h2>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-white transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-muted-light mb-4">
                Anyone with this link can view your sorted data — no account needed.
              </p>

              {url ? (
                <div className="flex gap-2">
                  <div className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-2.5 overflow-hidden">
                    <p className="text-xs text-brand-light truncate font-mono">{url}</p>
                  </div>
                  <button
                    onClick={copy}
                    className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-brand hover:bg-brand-dark text-white"
                    } shadow-[0_2px_8px_rgba(99,102,241,0.3)]`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              ) : (
                <div className="animate-pulse h-12 bg-surface rounded-lg" />
              )}

              <p className="mt-4 text-xs text-muted">
                The link encodes your data directly — nothing is stored on a server.
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
