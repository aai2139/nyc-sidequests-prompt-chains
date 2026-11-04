"use client";

import { useState } from "react";

const modes = ["system", "light", "dark"] as const;
type Mode = typeof modes[number];

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "system";
    const saved = localStorage.getItem("theme") as Mode | null;
    return saved && modes.includes(saved) ? saved : "system";
  });
  function choose(next: Mode) {
    setMode(next); localStorage.setItem("theme", next);
    document.documentElement.dataset.theme = next;
  }
  return <button className="theme-toggle" onClick={() => choose(modes[(modes.indexOf(mode) + 1) % modes.length])} title="Cycle color theme" aria-label={`Color theme: ${mode}`}>
    <span aria-hidden>{mode === "dark" ? "●" : mode === "light" ? "○" : "◐"}</span> {mode}
  </button>;
}
