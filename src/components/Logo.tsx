"use client";

import { motion } from "framer-motion";

export default function Logo() {
  return (
    <motion.div
      className="flex items-center gap-2.5"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* icon: stacked bars */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="3" width="10" height="4" rx="2" fill="#6366f1" />
        <rect x="2" y="9" width="16" height="4" rx="2" fill="#818cf8" />
        <rect x="2" y="15" width="7" height="4" rx="2" fill="#a5b4fc" />
        <rect x="2" y="21" width="20" height="4" rx="2" fill="#6366f1" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-white">
        Sort<span className="text-brand-light">ly</span>
      </span>
    </motion.div>
  );
}
