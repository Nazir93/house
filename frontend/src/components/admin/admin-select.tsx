"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSelectItem = { value: string; label: React.ReactNode };

const defaultTrigger =
  "flex w-full min-w-0 items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-white/[0.08] text-sm text-left " +
  "bg-white/[0.05] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3D2E]/45 focus-visible:border-[#0F3D2E]/50 " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const listBox =
  "max-h-[min(18rem,70vh)] overflow-auto rounded-xl border border-white/[0.12] py-1 " +
  "bg-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.42)] backdrop-blur-md " +
  "outline-none";

const optionBase =
  "w-full cursor-pointer px-4 py-2.5 text-left text-sm text-white transition-colors " +
  "hover:bg-[#0F3D2E]/22 focus:bg-[#0F3D2E]/22 focus:outline-none";

const optionSelected = "bg-[#0F3D2E]/28 text-emerald-200 font-medium";

export type AdminSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: AdminSelectItem[];
  /** Обертка (ширина, отступы). */
  className?: string;
  /** Доп. классы кнопки-триггера (например rounded-lg py-2 для компактных строк). */
  triggerClassName?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
};

function getAdminSelectPortalRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector(".admin-main-surface") ?? document.body;
}

export function AdminSelect({
  value,
  onValueChange,
  options,
  className,
  triggerClassName,
  disabled,
  placeholder = "Выберите…",
  id,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? placeholder;

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelStyle({ top: r.bottom + 6, left: r.left, width: r.width });
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    setOpen((o) => !o);
  };

  const choose = (v: string) => {
    onValueChange(v);
    setOpen(false);
  };

  const listNode =
    open && panelStyle ? (
      <ul
        id={listId}
        role="listbox"
        className={cn(listBox, "admin-select-dropdown")}
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
              className={cn(optionBase, o.value === value && optionSelected)}
              onClick={() => choose(o.value)}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={toggle}
        className={cn(defaultTrigger, triggerClassName)}
      >
        <span className={cn("truncate", !selected && "text-white/40")}>{display}</span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-white/45 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {typeof document !== "undefined" && listNode
        ? createPortal(listNode, getAdminSelectPortalRoot() ?? document.body)
        : null}
    </div>
  );
}
