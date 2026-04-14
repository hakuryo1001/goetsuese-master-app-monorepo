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

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-line bg-elevated text-ink transition hover:border-line-strong hover:bg-muted"
      aria-label={label}
    >
      {mode === null ? (
        <HiOutlineSun
          className="h-[1.15rem] w-[1.15rem] text-ink-muted opacity-40"
          aria-hidden
        />
      ) : mode === "dark" ? (
        <HiOutlineSun className="h-[1.15rem] w-[1.15rem]" aria-hidden />
      ) : (
        <HiOutlineMoon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
      )}
    </button>
  );
}
