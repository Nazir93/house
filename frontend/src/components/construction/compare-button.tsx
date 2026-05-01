"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "house-project-compare";
const LIMIT = 4;

function readCompare(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeCompare(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, LIMIT)));
  window.dispatchEvent(new CustomEvent("house-compare-change", { detail: ids.slice(0, LIMIT) }));
}

export function CompareButton({ projectId, className }: { projectId: string; className?: string }) {
  const [ids, setIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const active = ids.includes(projectId);

  useEffect(() => {
    const sync = () => setIds(readCompare());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("house-compare-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("house-compare-change", sync);
    };
  }, []);

  function toggle() {
    setMessage("");
    const current = readCompare();
    if (current.includes(projectId)) {
      const next = current.filter((id) => id !== projectId);
      writeCompare(next);
      setIds(next);
      return;
    }
    if (current.length >= LIMIT) {
      setMessage("В сравнении может быть максимум 4 проекта.");
      return;
    }
    const next = [...current, projectId];
    writeCompare(next);
    setIds(next);
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
          className
        )}
        style={{
          borderColor: active ? "var(--accent)" : "var(--border)",
          backgroundColor: active ? "var(--accent)" : "transparent",
          color: active ? "var(--accent-contrast)" : "var(--text)",
        }}
      >
        {active ? "В сравнении" : "Сравнить"}
      </button>
      {message ? <p className="text-xs" style={{ color: "var(--sale)" }}>{message}</p> : null}
    </div>
  );
}

export function useComparedProjectIds() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(readCompare());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("house-compare-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("house-compare-change", sync);
    };
  }, []);
  return ids;
}

export function removeComparedProject(projectId: string) {
  const next = readCompare().filter((id) => id !== projectId);
  writeCompare(next);
}
