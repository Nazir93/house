"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortfolioFilterSelectItem = { value: string; label: string };

const triggerClass =
  "inline-flex min-w-0 max-w-full items-center justify-between gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors sm:px-3.5 sm:py-2 sm:text-[13px]";

export function PortfolioFilterSelect({
  label,
  value,
  onValueChange,
  options,
  active = false,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: PortfolioFilterSelectItem[];
  active?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const display = selected && selected.value !== "all" ? selected.label : label;

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelStyle({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 168) });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      const portal = document.getElementById(listId);
      if (portal?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, listId]);

  const listNode =
    open && panelStyle ? (
      <ul
        id={listId}
        role="listbox"
        className="max-h-[min(16rem,60vh)] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-1 shadow-lg"
        style={{
          position: "fixed",
          top: panelStyle.top,
          left: panelStyle.left,
          width: panelStyle.width,
          zIndex: 10050,
        }}
      >
        {options.map((o) => (
          <li key={o.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={cn(
                "w-full px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]",
                o.value === value && "font-semibold text-[var(--accent)]"
              )}
              onClick={() => {
                onValueChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          triggerClass,
          active
            ? "border-[var(--accent)] bg-[rgba(15,61,46,0.12)] text-[var(--accent)] dark:bg-[rgba(61,143,110,0.18)]"
            : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] hover:border-[var(--accent)]/50 dark:bg-[var(--card-bg)]"
        )}
      >
        <span className="truncate">{display}</span>
        <ChevronDown size={14} className={cn("shrink-0 opacity-60 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {typeof document !== "undefined" && listNode ? createPortal(listNode, document.body) : null}
    </div>
  );
}
