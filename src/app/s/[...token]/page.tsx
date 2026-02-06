"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import DataTable from "@/components/DataTable";
import { decodeShare } from "@/lib/share";
import { sortRows } from "@/lib/sort";
import type { Row, SortRule } from "@/lib/types";

interface SharedPayload {
  columns: string[];
  rows: Row[];
  sortRules: SortRule[];
  label?: string;
}

export default function SharePage({ params }: { params: Promise<{ token: string[] }> }) {
  const [data, setData] = useState<SharedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resolved = await params;
        const token = resolved.token.join("/");
        const payload = await decodeShare<SharedPayload>(token);
        if (!payload.columns || !payload.rows) throw new Error("bad");
        setData(payload);
      } catch {
        setError("This link is invalid or the data could not be decoded.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  const sortedRows = data ? sortRows(data.rows, data.sortRules) : [];

  /* ─── loading ──────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">Decoding…</p>
        </motion.div>
      </div>
    );
  }

  /* ─── error ────────────────────────────────────────────────────────── */
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <Navbar />
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid link</h1>
          <p className="text-muted-light text-sm">{error}</p>
          <a
            href="/"
            className="mt-5 inline-block bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Go home
          </a>
        </motion.div>
      </div>
    );
  }

  /* ─── success ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen">
      <Navbar />

      <motion.div
        className="max-w-6xl mx-auto px-5 py-8 pt-20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {data.label || "Shared Sort"}
            </h1>
            <p className="text-xs text-muted mt-1">
              {data.columns.length} columns · {data.rows.length} rows · shared via Sortly
            </p>
          </div>

          {/* "Use in Sortly" button */}
          <a
            href="/"
            className="inline-flex items-center gap-1.5 border border-surface-border text-muted-light hover:text-white hover:border-brand transition-colors text-sm font-medium px-4 py-2 rounded-lg"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sort this yourself
          </a>
        </div>

        {/* active sort pills (read-only display) */}
        {data.sortRules.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Sorted by
            </span>
            {data.sortRules.map((rule, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-brand/10 border border-brand/25 text-brand-light text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {rule.column}
                <span className="opacity-60">{rule.direction === "asc" ? "↑" : "↓"}</span>
                <span className="opacity-40">{rule.type}</span>
              </span>
            ))}
          </div>
        )}

        {/* table — read only */}
        <DataTable
          columns={data.columns}
          rows={sortedRows}
          sortRules={data.sortRules}
          readonly
        />
      </motion.div>
    </div>
  );
}
