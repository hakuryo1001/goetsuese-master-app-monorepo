"use client";

import { useCallback, useEffect, useState } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

type Scheme = "light" | "dark";

function readStored(): Scheme | null {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  return null;
}

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyToDom(mode: Scheme) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Scheme | null>(null);

  useEffect(() => {
    const stored = readStored();
    const initial = stored ?? (prefersDark() ? "dark" : "light");
    applyToDom(initial);
    setMode(initial);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      if (prev === null) return prev;
      const next: Scheme = prev === "dark" ? "light" : "dark";
      applyToDom(next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const label =
    mode === "dark"
      ? "Switch to light mode"
      : mode === "light"
        ? "Switch to dark mode"
        : "Theme";

  const isDark = mode === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mode === null ? false : isDark}
      aria-label={label}
      disabled={mode === null}
      onClick={toggle}
      className="relative h-9 w-16 shrink-0 rounded-full border border-line bg-muted p-[3px] shadow-inner transition-opacity hover:border-line-strong disabled:opacity-50"
    >
      <span
        className="pointer-events-none absolute inset-[3px] z-[2] flex select-none items-center justify-between px-1"
        aria-hidden
      >
        <HiOutlineSun
          className={`h-3.5 w-3.5 shrink-0 transition-colors ${!isDark && mode !== null ? "text-ink" : "text-ink-muted"}`}
        />
        <HiOutlineMoon
          className={`h-3.5 w-3.5 shrink-0 transition-colors ${isDark ? "text-ink" : "text-ink-muted"}`}
        />
      </span>

      <span
        aria-hidden
        className={`pointer-events-none absolute top-[3px] z-[1] h-[calc(100%-6px)] w-[44%] rounded-full border border-line bg-elevated shadow transition-[left] duration-200 ease-out ${
          isDark ? "left-[calc(56%-1px)]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
