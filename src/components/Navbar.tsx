"use client";

import Logo from "./Logo";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Logo />
        <span className="text-xs text-muted-light bg-surface-elevated border border-surface-border rounded-full px-3 py-1">
          paste · sort · share
        </span>
      </div>
    </nav>
  );
}
